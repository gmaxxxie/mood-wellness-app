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
('How enthusiastic do you feel right now?', '你现在感觉有多热情？', 'scale', 'positive_affect', 
'{"scale": {"min": 1, "max": 5, "labels": ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["非常轻微", "有一点", "中等程度", "相当多", "极其"]}', 1.0),

('How alert and attentive do you feel?', '你感觉多么警觉和专注？', 'scale', 'positive_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["非常轻微", "有一点", "中等程度", "相当多", "极其"]}', 1.0),

('How determined do you feel to tackle challenges?', '你对应对挑战感到多么坚定？', 'scale', 'positive_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["非常轻微", "有一点", "中等程度", "相当多", "极其"]}', 1.0),

-- PANAS消极情感问题  
('How distressed or upset do you feel?', '你感到多么痛苦或不安？', 'scale', 'negative_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["非常轻微", "有一点", "中等程度", "相当多", "极其"]}', 1.2),

('How nervous or anxious are you feeling?', '你感到多么紧张或焦虑？', 'scale', 'negative_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["非常轻微", "有一点", "中等程度", "相当多", "极其"]}', 1.2),

('How irritable or hostile do you feel?', '你感到多么易怒或敌对？', 'scale', 'negative_affect',
'{"scale": {"min": 1, "max": 5, "labels": ["Very slightly", "A little", "Moderately", "Quite a bit", "Extremely"]}, "labels_zh": ["非常轻微", "有一点", "中等程度", "相当多", "极其"]}', 1.1),

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
('What triggered your current emotional state?', '是什么引发了您当前的情绪状态？', 'multiple_choice', 'situational',
'{"options": ["Work/Study stress", "Relationship issues", "Health concerns", "Financial worries", "Social situations", "No specific trigger", "Other"], "options_zh": ["工作/学习压力", "人际关系问题", "健康担忧", "经济担忧", "社交场合", "没有特定原因", "其他"]}', 0.8),

('How would you describe your energy level right now?', '您如何描述自己现在的精力水平？', 'multiple_choice', 'energy',
'{"options": ["Very low", "Low", "Moderate", "High", "Very high"], "options_zh": ["很低", "低", "中等", "高", "很高"]}', 0.9),

('How much control do you feel you have over your emotions right now?', '您觉得现在对自己情绪的控制力如何？', 'scale', 'control',
'{"scale": {"min": 1, "max": 5, "labels": ["No control", "Little control", "Some control", "Good control", "Complete control"]}, "labels_zh": ["无控制力", "控制力很少", "有一些控制力", "控制力良好", "完全可控"]}', 1.0);