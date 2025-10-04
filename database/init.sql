-- 情绪舒缓应用数据库初始化脚本
-- 基于PANAS量表和情绪调节理论设计

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- 情绪分类表 (基于Ekman六基本情绪扩展)
CREATE TABLE emotion_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    description TEXT,
    color_code VARCHAR(7), -- HEX颜色代码
    parent_id INTEGER REFERENCES emotion_categories(id),
    is_primary BOOLEAN DEFAULT false
);

-- 情绪标签表
CREATE TABLE emotion_tags (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES emotion_categories(id),
    tag_name VARCHAR(100) NOT NULL,
    tag_name_zh VARCHAR(100) NOT NULL,
    intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评估问题库 (基于PANAS、PHQ-2、GAD-7等量表)
CREATE TABLE assessment_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_text_zh TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'scale', 'boolean'
    category VARCHAR(100), -- 'positive_affect', 'negative_affect', 'anxiety', 'depression'
    options JSONB, -- 选项数据
    weight DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 解决方案类型表
CREATE TABLE solution_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_name_zh VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- 图标名称
    color VARCHAR(7) -- HEX颜色
);

-- 解决方案库
CREATE TABLE solutions (
    id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES solution_types(id),
    title VARCHAR(255) NOT NULL,
    title_zh VARCHAR(255) NOT NULL,
    description TEXT,
    description_zh TEXT,
    instructions TEXT NOT NULL,
    instructions_zh TEXT NOT NULL,
    duration_minutes INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    resource_url VARCHAR(500), -- 音频、视频等资源链接
    tags TEXT[], -- 标签数组
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 情绪解决方案映射表
CREATE TABLE emotion_solution_mapping (
    id SERIAL PRIMARY KEY,
    emotion_category_id INTEGER REFERENCES emotion_categories(id),
    solution_id INTEGER REFERENCES solutions(id),
    effectiveness_weight DECIMAL(3,2) DEFAULT 1.0,
    priority_order INTEGER DEFAULT 1
);

-- 用户评估记录
CREATE TABLE user_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    assessment_type VARCHAR(50) NOT NULL, -- 'quick', 'detailed', 'voice'
    responses JSONB NOT NULL, -- 用户回答数据
    emotion_scores JSONB, -- 各情绪维度得分
    primary_emotion INTEGER REFERENCES emotion_categories(id),
    secondary_emotion INTEGER REFERENCES emotion_categories(id),
    intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 推荐记录
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    assessment_id INTEGER REFERENCES user_assessments(id),
    solution_id INTEGER REFERENCES solutions(id),
    recommendation_score DECIMAL(3,2),
    reason TEXT,
    is_accepted BOOLEAN,
    completed_at TIMESTAMP,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 语音记录表
CREATE TABLE voice_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    assessment_id INTEGER REFERENCES user_assessments(id),
    audio_file_path VARCHAR(500),
    transcription TEXT,
    emotion_analysis JSONB,
    processing_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户使用统计
CREATE TABLE user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_assessments INTEGER DEFAULT 0,
    total_recommendations_used INTEGER DEFAULT 0,
    favorite_solution_type INTEGER REFERENCES solution_types(id),
    average_mood_improvement DECIMAL(3,2),
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提升查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX idx_user_assessments_created_at ON user_assessments(created_at);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_assessment_id ON recommendations(assessment_id);
CREATE INDEX idx_emotion_tags_category_id ON emotion_tags(category_id);
CREATE INDEX idx_solutions_type_id ON solutions(type_id);
CREATE INDEX idx_voice_records_user_id ON voice_records(user_id);

-- 创建更新时间自动触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();