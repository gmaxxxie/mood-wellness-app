-- 种子数据：基于科学心理学理论的情绪分类和问题库

-- 插入基础情绪分类 (基于Ekman六基本情绪 + 扩展情绪)
INSERT INTO emotion_categories (name, name_zh, description, color_code, parent_id, is_primary) VALUES

-- 六基本情绪
('happiness', '快乐', 'Positive emotion characterized by feelings of joy, satisfaction, contentment', '#FFD700', NULL, true),
('sadness', '悲伤', 'Negative emotion characterized by feelings of grief, sorrow, disappointment', '#4682B4', NULL, true),
('anger', '愤怒', 'Negative emotion characterized by feelings of hostility, irritation, frustration', '#FF6347', NULL, true),
('fear', '恐惧', 'Negative emotion characterized by feelings of anxiety, worry, nervousness', '#8B008B', NULL, true),
('surprise', '惊讶', 'Neutral emotion characterized by feelings of wonder, amazement, curiosity', '#FF8C00', NULL, true),
('disgust', '厌恶', 'Negative emotion characterized by feelings of revulsion, distaste, aversion', '#228B22', NULL, true),

-- 扩展情绪类别
('anxiety', '焦虑', 'Persistent worry and nervousness about future events', '#800080', 4, false),
('stress', '压力', 'Physical and mental strain from challenging situations', '#DC143C', 4, false),
('loneliness', '孤独', 'Feeling of isolation and disconnection from others', '#4169E1', 2, false),
('excitement', '兴奋', 'High-energy positive emotion with anticipation', '#FF1493', 1, false),
('contentment', '满足', 'Peaceful satisfaction and acceptance', '#32CD32', 1, false),
('frustration', '挫败', 'Feeling blocked or prevented from achieving goals', '#B22222', 3, false),
('overwhelm', '不知所措', 'Feeling unable to cope with demands or situations', '#696969', 4, false),
('boredom', '无聊', 'Lack of interest or stimulation in current situation', '#A0A0A0', NULL, false);

-- 插入情绪标签 (基于PANAS量表的积极和消极情感词汇)
INSERT INTO emotion_tags (category_id, tag_name, tag_name_zh, intensity_level) VALUES

-- 快乐相关标签 (Positive Affect from PANAS)
(1, 'enthusiastic', '热情的', 8),
(1, 'alert', '警觉的', 6),
(1, 'determined', '坚定的', 7),
(1, 'excited', '兴奋的', 9),
(1, 'inspired', '受启发的', 8),
(1, 'strong', '强壮的', 7),
(1, 'active', '活跃的', 7),
(10, 'elated', '兴高采烈的', 9),
(11, 'peaceful', '平静的', 6),
(11, 'satisfied', '满足的', 7),

-- 悲伤相关标签
(2, 'down', '沮丧的', 6),
(2, 'blue', '忧郁的', 5),
(2, 'melancholy', '忧愁的', 6),
(2, 'dejected', '沮丧的', 7),
(9, 'isolated', '孤立的', 7),
(9, 'disconnected', '疏离的', 6),

-- 愤怒相关标签
(3, 'irritated', '烦躁的', 5),
(3, 'hostile', '敌对的', 8),
(3, 'aggressive', '好斗的', 9),
(12, 'annoyed', '恼怒的', 4),
(12, 'impatient', '不耐烦的', 5),

-- 恐惧/焦虑相关标签 (Negative Affect from PANAS)
(4, 'scared', '害怕的', 7),
(4, 'afraid', '恐惧的', 8),
(4, 'nervous', '紧张的', 6),
(7, 'worried', '担心的', 6),
(7, 'anxious', '焦虑的', 7),
(7, 'tense', '紧张的', 6),
(7, 'restless', '不安的', 5),
(8, 'stressed', '有压力的', 7),
(8, 'overwhelmed', '不堪重负的', 8),
(13, 'helpless', '无助的', 8),

-- 中性/其他情绪标签
(5, 'surprised', '惊讶的', 6),
(5, 'amazed', '惊奇的', 7),
(6, 'disgusted', '厌恶的', 7),
(14, 'bored', '无聊的', 4),
(14, 'uninterested', '无兴趣的', 3);

-- 插入解决方案类型
INSERT INTO solution_types (type_name, type_name_zh, description, icon, color) VALUES
('breathing', '呼吸练习', 'Breathing exercises and techniques for immediate calm', 'air', '#87CEEB'),
('music', '音乐疗法', 'Music-based interventions for mood regulation', 'music_note', '#DDA0DD'),
('mindfulness', '正念冥想', 'Mindfulness and meditation practices', 'self_improvement', '#98FB98'),
('physical', '身体活动', 'Physical exercises and movement for mood improvement', 'fitness_center', '#FFA07A'),
('cognitive', '认知重构', 'Cognitive reframing and positive thinking techniques', 'psychology', '#F0E68C'),
('social', '社交支持', 'Social connection and support seeking activities', 'group', '#DEB887'),
('creative', '创意表达', 'Creative activities for emotional expression', 'palette', '#FFB6C1'),
('relaxation', '放松技巧', 'Progressive muscle relaxation and tension release', 'spa', '#B0E0E6');

-- 插入评估问题 (基于PANAS量表、PHQ-2、GAD-7简化版)
INSERT INTO assessment_questions (question_text, question_text_zh, question_type, category, options, weight) VALUES

-- PANAS积极情感问题
('How energized and enthusiastic do you feel right now?', '你此刻感到多有活力和热情？', 'scale', 'positive_affect', 
'{"scale": {"min": 1, "max": 5, "labels": ["Very low energy", "Somewhat low", "Neutral", "Quite energized", "Highly energized"]}, "labels_zh": ["非常低", "较低", "中等", "较有活力", "活力十足"]}', 1.0),

('How focused or absorbed are you in your current activity right now?', '你现在对眼前的事情投入度有多高？', 'scale', 'positive_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very distracted", "Somewhat distracted", "Neutral", "Focused", "Deeply absorbed"]}, "labels_zh": ["非常分心", "有点分心", "一般", "专注", "全神贯注"]}', 1.1),

('Thinking about the rest of today, how optimistic do you feel?', '想到今天剩下的时间，你的乐观程度如何？', 'scale', 'positive_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very pessimistic", "Somewhat pessimistic", "Balanced", "Somewhat optimistic", "Very optimistic"]}, "labels_zh": ["非常悲观", "略偏悲观", "中性", "稍感乐观", "非常乐观"]}', 1.0),

-- PANAS消极情感问题  
('Right now, how close do you feel to becoming overwhelmed by your responsibilities?', '此刻面对责任时，你觉得自己距离被压垮有多近？', 'scale', 'negative_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Not at all", "Slightly close", "Somewhat close", "Quite close", "I already feel overwhelmed"]}, "labels_zh": ["完全不会", "稍微接近", "有些接近", "非常接近", "几乎被压垮"]}', 1.2),

('Right now, how strongly are you noticing physical signs of stress (e.g., clenched jaw, tight shoulders)?', '此刻你注意到身体紧张迹象（如下颌紧绷、肩颈僵硬）的程度如何？', 'scale', 'negative_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Not at all", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["完全没有", "有一点", "中等", "相当明显", "非常明显"]}', 1.1),

('When minor setbacks happen today, how quickly does irritation rise for you?', '今天遇到小挫折时，你的恼怒感上升得有多快？', 'scale', 'negative_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["I stay calm", "It builds slowly", "It shows up occasionally", "It rises quickly", "It flares almost instantly"]}, "labels_zh": ["我保持冷静", "情绪缓慢升温", "偶尔会冒起烦躁", "很快就感到烦躁", "几乎瞬间爆发"]}', 1.0),

-- 简化的PHQ-2问题 (抑郁筛查)
('Over the past 2 weeks, how often have you felt down, depressed, or hopeless?', '在过去2周里，您有多经常感到沮丧、抑郁或绝望？', 'scale', 'depression',
'{"scale": {"min": 0, "max": 3, "labels": ["Not at all", "Several days", "More than half the days", "Nearly every day"]}, "labels_zh": ["完全没有", "几天", "超过一半的天数", "几乎每天"]}', 1.5),

('Over the past 2 weeks, how often have you had little interest or pleasure in doing things?', '在过去2周里，您有多经常对做事情缺乏兴趣或乐趣？', 'scale', 'depression',
'{"scale": {"min": 0, "max": 3, "labels": ["Not at all", "Several days", "More than half the days", "Nearly every day"]}, "labels_zh": ["完全没有", "几天", "超过一半的天数", "几乎每天"]}', 1.5),

-- 简化的GAD-2问题 (焦虑筛查)
('Over the past 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?', '在过去2周里，您有多经常被紧张、焦虑或烦躁的感觉困扰？', 'scale', 'anxiety',
'{"scale": {"min": 0, "max": 3, "labels": ["Not at all", "Several days", "More than half the days", "Nearly every day"]}, "labels_zh": ["完全没有", "几天", "超过一半的天数", "几乎每天"]}', 1.4),

('Over the past 2 weeks, how often have you been unable to stop or control worrying?', '在过去2周里，您有多经常无法停止或控制担忧？', 'scale', 'anxiety',
'{"scale": {"min": 0, "max": 3, "labels": ["Not at all", "Several days", "More than half the days", "Nearly every day"]}, "labels_zh": ["完全没有", "几天", "超过一半的天数", "几乎每天"]}', 1.4),

-- 情境化快速评估问题
('What is the main trigger for your current emotional state?', '是什么主要诱因带来了您当前的情绪状态？', 'multiple_choice', 'situational',
'{"options": ["Work or study pressure", "Family or relationship issues", "Health concerns", "Financial pressure", "Social interactions", "Recent life changes or uncertainty", "No clear trigger", "Other"], "options_zh": ["工作或学习压力", "家庭或人际关系问题", "健康担忧", "经济压力", "社交场景", "近期变化或不确定性", "没有清晰诱因", "其他"]}', 0.8),

('Compared with your usual state, how is your energy level right now?', '与平时相比，你此刻的精力水平如何？', 'multiple_choice', 'energy',
'{"options": ["Very low", "Low", "Moderate", "High", "Very high"], "options_zh": ["很低", "较低", "中等", "较高", "很高"]}', 0.9),

('Right now, how much control do you feel you have over your emotions?', '你现在觉得自己对情绪的掌控力有多大？', 'scale', 'control',
'{"scale": {"min": 1, "max": 5, "labels": ["No control", "Little control", "Some control", "Good control", "Complete control"]}, "labels_zh": ["几乎无法控制", "控制力很少", "有一些控制力", "控制力良好", "完全可控"]}', 1.0),

-- 认知评价维度
('Over the past few days, when challenges appear, how often do you jump to the worst-case scenario?', '在过去几天里，当遇到挑战时，你有多常自动想到最糟糕的结果？', 'scale', 'cognitive_appraisal',
'{"scale": {"min": 0, "max": 3, "labels": ["Never", "Sometimes", "Often", "Almost always"]}, "labels_zh": ["从不", "偶尔", "经常", "几乎总是"]}', 1.2),

('Which statement best reflects how you process difficult thoughts right now?', '以下哪句话最能描述你当前处理困难想法的方式？', 'multiple_choice', 'cognitive_appraisal',
'{"options": ["I reframe challenges into learning opportunities", "I assume small issues will escalate quickly", "I distract myself instead of addressing worries", "I pause to gather facts before reacting"], "options_zh": ["我会把挑战转成学习机会", "我会认为小事会迅速恶化", "我会转移注意而非处理担忧", "我会先停下来收集事实再回应"]}', 1.0),

-- 环境影响维度
('Which surroundings are influencing your mood the most right now?', '当前哪类环境最影响你的情绪？', 'multiple_choice', 'environment',
'{"options": ["Noise or crowded spaces", "Lack of natural light or fresh air", "Supportive and calming setting", "Constant digital notifications", "Feeling isolated or disconnected"], "options_zh": ["嘈杂或拥挤的环境", "缺乏自然光或新鲜空气", "支持且安静的场所", "不断响起的电子提醒", "感到孤立或与人疏离"]}', 0.9),

('Over the past week, how satisfied are you with the balance between work/study and rest?', '过去一周内，你对工作或学习与休息的平衡感到多满意？', 'scale', 'environment',
'{"scale": {"min": 1, "max": 5, "labels": ["Very dissatisfied", "Somewhat dissatisfied", "Neutral", "Somewhat satisfied", "Very satisfied"]}, "labels_zh": ["非常不满意", "有点不满意", "一般", "有点满意", "非常满意"]}', 1.1);
