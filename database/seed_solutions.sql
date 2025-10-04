-- 解决方案库种子数据 - 基于科学的情绪调节和心理健康干预方法

-- 呼吸练习解决方案
INSERT INTO solutions (type_id, title, title_zh, description, description_zh, instructions, instructions_zh, duration_minutes, difficulty_level, tags, effectiveness_score) VALUES

(1, '4-7-8 Breathing Technique', '4-7-8呼吸法', 'A simple breathing pattern that helps reduce anxiety and promotes relaxation', '一种简单的呼吸模式，有助于减少焦虑并促进放松', 
'1. Exhale completely through your mouth\n2. Close your mouth and inhale through nose for 4 counts\n3. Hold your breath for 7 counts\n4. Exhale through mouth for 8 counts\n5. Repeat 3-4 cycles', 
'1. 用嘴完全呼气\n2. 闭嘴，用鼻子吸气4拍\n3. 屏住呼吸7拍\n4. 用嘴呼气8拍\n5. 重复3-4个周期', 
5, 1, '{"anxiety", "stress", "quick", "beginner"}', 4.2),

(1, 'Box Breathing', '方形呼吸法', 'Four-count breathing technique used by Navy SEALs for stress management', '海军特种部队使用的四拍呼吸技术，用于压力管理',
'1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold empty for 4 counts\n5. Repeat for 5-10 minutes',
'1. 吸气4拍\n2. 屏气4拍\n3. 呼气4拍\n4. 空气屏住4拍\n5. 重复5-10分钟',
10, 2, '{"stress", "focus", "intermediate", "concentration"}', 4.5),

(1, 'Deep Belly Breathing', '腹式深呼吸', 'Diaphragmatic breathing to activate the parasympathetic nervous system', '膈肌呼吸激活副交感神经系统',
'1. Place one hand on chest, one on belly\n2. Breathe slowly through nose\n3. Ensure belly hand moves more than chest hand\n4. Exhale slowly through pursed lips\n5. Continue for 10-15 minutes',
'1. 一只手放在胸部，一只手放在腹部\n2. 用鼻子慢慢呼吸\n3. 确保腹部的手比胸部的手移动得更多\n4. 通过撅起的嘴唇慢慢呼气\n5. 持续10-15分钟',
15, 1, '{"relaxation", "sleep", "beginner", "physical"}', 4.3);

-- 音乐疗法解决方案  
INSERT INTO solutions (type_id, title, title_zh, description, description_zh, instructions, instructions_zh, duration_minutes, difficulty_level, tags, effectiveness_score) VALUES

(2, 'Classical Music for Anxiety Relief', '古典音乐缓解焦虑', 'Listen to specifically selected classical pieces proven to reduce cortisol levels', '聆听经过特别挑选的古典音乐，被证明能降低皮质醇水平',
'1. Find a comfortable, quiet space\n2. Use headphones or quality speakers\n3. Close your eyes and focus on the music\n4. Let your mind follow the melodies\n5. Breathe naturally and deeply',
'1. 找一个舒适、安静的空间\n2. 使用耳机或高质量扬声器\n3. 闭上眼睛，专注于音乐\n4. 让你的思维跟随旋律\n5. 自然深呼吸',
20, 1, '{"anxiety", "classical", "passive", "relaxation"}', 4.1),

(2, 'Upbeat Music for Mood Boost', '欢快音乐提升情绪', 'Energetic music playlist designed to increase dopamine and improve mood', '旨在增加多巴胺和改善情绪的活力音乐播放列表',
'1. Choose upbeat songs you enjoy\n2. Turn up the volume (safely)\n3. Allow yourself to move or dance\n4. Sing along if you feel like it\n5. Focus on positive lyrics and rhythm',
'1. 选择你喜欢的欢快歌曲\n2. 调高音量（安全地）\n3. 允许自己移动或跳舞\n4. 如果你愿意，可以跟着唱\n5. 专注于积极的歌词和节奏',
15, 1, '{"mood_boost", "energy", "active", "dopamine"}', 4.0),

(2, 'Nature Sounds Meditation', '自然声音冥想', 'Ambient nature sounds for stress reduction and mental clarity', '用于减压和提高思维清晰度的环境自然声音',
'1. Choose nature sounds (rain, ocean, forest)\n2. Sit comfortably with eyes closed\n3. Visualize yourself in that environment\n4. Focus on the details of the sounds\n5. Let thoughts pass without judgment',
'1. 选择自然声音（雨声、海浪声、森林声）\n2. 舒适地坐着，闭上眼睛\n3. 想象自己在那个环境中\n4. 专注于声音的细节\n5. 让思想过去而不加评判',
25, 2, '{"nature", "meditation", "visualization", "stress"}', 4.4);

-- 正念冥想解决方案
INSERT INTO solutions (type_id, title, title_zh, description, description_zh, instructions, instructions_zh, duration_minutes, difficulty_level, tags, effectiveness_score) VALUES

(3, '5-Minute Mindfulness', '5分钟正念', 'Quick mindfulness practice for immediate stress relief', '快速正念练习，立即缓解压力',
'1. Sit comfortably with feet on ground\n2. Close eyes or soften gaze\n3. Notice 5 things you can hear\n4. Notice 4 things you can touch\n5. Notice 3 things you can smell\n6. Take 2 deep breaths\n7. Notice 1 thing you''re grateful for',
'1. 舒适地坐着，脚踏实地\n2. 闭上眼睛或放松凝视\n3. 注意5件你能听到的事情\n4. 注意4件你能触摸的事情\n5. 注意3件你能闻到的事情\n6. 深呼吸2次\n7. 注意1件你感激的事情',
5, 1, '{"quick", "grounding", "5-4-3-2-1", "present"}', 4.3),

(3, 'Body Scan Meditation', '身体扫描冥想', 'Progressive awareness of physical sensations for deep relaxation', '对身体感觉的渐进意识，实现深度放松',
'1. Lie down comfortably\n2. Start from the top of your head\n3. Slowly scan down through each body part\n4. Notice sensations without changing anything\n5. If mind wanders, gently return to body\n6. End at your toes',
'1. 舒适地躺下\n2. 从头顶开始\n3. 慢慢向下扫描每个身体部位\n4. 注意感觉而不改变任何东西\n5. 如果思维游荡，轻轻回到身体\n6. 在脚趾处结束',
20, 2, '{"body_awareness", "relaxation", "sleep", "intermediate"}', 4.6),

(3, 'Loving-Kindness Meditation', '慈爱冥想', 'Cultivation of compassion and positive emotions towards self and others', '培养对自己和他人的慈悲和积极情绪',
'1. Sit quietly and breathe naturally\n2. Start with sending love to yourself\n3. Repeat: "May I be happy, may I be healthy, may I be at peace"\n4. Extend these wishes to loved ones\n5. Then to neutral people\n6. Finally to difficult people\n7. End with all beings everywhere',
'1. 安静地坐着，自然呼吸\n2. 开始向自己发送爱\n3. 重复："愿我快乐，愿我健康，愿我平静"\n4. 将这些祝愿延伸到所爱的人\n5. 然后到中性的人\n6. 最后到困难的人\n7. 以对所有众生的祝愿结束',
15, 3, '{"compassion", "self_love", "relationships", "advanced"}', 4.4);

-- 身体活动解决方案
INSERT INTO solutions (type_id, title, title_zh, description, description_zh, instructions, instructions_zh, duration_minutes, difficulty_level, tags, effectiveness_score) VALUES

(4, 'Quick Energy Boost Workout', '快速能量提升锻炼', '5-minute high-intensity exercises to increase endorphins and energy', '5分钟高强度运动，增加内啡肽和能量',
'1. 30 seconds jumping jacks\n2. 30 seconds push-ups (modified if needed)\n3. 30 seconds high knees\n4. 30 seconds squats\n5. 30 seconds mountain climbers\n6. Rest 30 seconds between exercises\n7. Repeat sequence twice',
'1. 30秒开合跳\n2. 30秒俯卧撑（如需要可修改）\n3. 30秒高抬腿\n4. 30秒深蹲\n5. 30秒登山者\n6. 运动间休息30秒\n7. 重复序列两次',
5, 2, '{"energy", "endorphins", "quick", "cardio"}', 4.2),

(4, 'Gentle Yoga Flow', '温和瑜伽流', 'Slow, mindful yoga sequence for stress relief and flexibility', '缓慢、专注的瑜伽序列，用于缓解压力和提高柔韧性',
'1. Start in child''s pose (2 minutes)\n2. Move to cat-cow stretches (2 minutes)\n3. Downward dog to forward fold (3 minutes)\n4. Warrior I and II poses (5 minutes)\n5. Seated spinal twist (2 minutes)\n6. End in savasana (6 minutes)',
'1. 从儿童式开始（2分钟）\n2. 移动到猫牛式伸展（2分钟）\n3. 下犬式到前屈式（3分钟）\n4. 战士一式和二式（5分钟）\n5. 坐姿脊柱扭转（2分钟）\n6. 在摊尸式中结束（6分钟）',
20, 2, '{"yoga", "flexibility", "mindful", "stress_relief"}', 4.5),

(4, 'Walking Meditation', '行走冥想', 'Mindful walking to combine physical movement with mental clarity', '正念行走，结合身体运动和心理清晰',
'1. Choose a quiet path 10-20 steps long\n2. Walk slower than normal\n3. Focus on the sensation of each step\n4. When you reach the end, pause and turn mindfully\n5. Notice your surroundings without judgment\n6. Continue for 10-15 minutes',
'1. 选择一条10-20步长的安静路径\n2. 比平时走得慢\n3. 专注于每一步的感觉\n4. 到达终点时，暂停并正念地转身\n5. 不加评判地注意周围环境\n6. 持续10-15分钟',
15, 1, '{"mindful", "outdoor", "gentle", "combination"}', 4.1);

-- 认知重构解决方案
INSERT INTO solutions (type_id, title, title_zh, description, description_zh, instructions, instructions_zh, duration_minutes, difficulty_level, tags, effectiveness_score) VALUES

(5, 'Thought Record Technique', '思维记录技术', 'CBT-based method to identify and challenge negative thought patterns', '基于CBT的方法，识别和挑战消极思维模式',
'1. Write down the negative thought\n2. Rate your belief in it (1-10)\n3. Identify the emotion it creates\n4. Look for evidence for and against the thought\n5. Create a more balanced, realistic thought\n6. Rate your belief in the new thought\n7. Notice how your emotion changes',
'1. 写下消极想法\n2. 评估你对它的相信程度（1-10）\n3. 识别它产生的情绪\n4. 寻找支持和反对这个想法的证据\n5. 创造一个更平衡、现实的想法\n6. 评估你对新想法的相信程度\n7. 注意你的情绪如何变化',
10, 3, '{"CBT", "negative_thoughts", "reframing", "writing"}', 4.7),

(5, 'Gratitude Practice', '感恩练习', 'Focusing on positive aspects to shift perspective and improve mood', '专注于积极方面，转变视角并改善情绪',
'1. Find a quiet moment\n2. Think of 3 specific things you''re grateful for today\n3. For each item, reflect on why you''re grateful\n4. Notice the physical sensations of gratitude\n5. Write them down if possible\n6. Take a moment to appreciate these feelings',
'1. 找一个安静的时刻\n2. 想想今天你感激的3件具体事情\n3. 对每一项，反思你为什么感激\n4. 注意感恩的身体感觉\n5. 如果可能，把它们写下来\n6. 花一点时间欣赏这些感觉',
5, 1, '{"gratitude", "perspective", "positive", "daily"}', 4.3),

(5, 'The 10-10-10 Rule', '10-10-10法则', 'Gaining perspective on problems by considering their impact over time', '通过考虑问题随时间的影响来获得视角',
'1. Identify what''s bothering you\n2. Ask: How will this matter in 10 minutes?\n3. Ask: How will this matter in 10 months?\n4. Ask: How will this matter in 10 years?\n5. Notice how your perspective shifts\n6. Use this insight to decide your response',
'1. 识别困扰你的事情\n2. 问：这在10分钟后会有多重要？\n3. 问：这在10个月后会有多重要？\n4. 问：这在10年后会有多重要？\n5. 注意你的视角如何转变\n6. 用这个洞察来决定你的回应',
5, 2, '{"perspective", "time", "problem_solving", "wisdom"}', 4.0);

-- 创建情绪-解决方案映射
INSERT INTO emotion_solution_mapping (emotion_category_id, solution_id, effectiveness_weight, priority_order) VALUES

-- 焦虑 -> 呼吸练习和正念
(7, 1, 1.0, 1), -- 4-7-8呼吸法
(7, 2, 0.9, 2), -- 方形呼吸法
(7, 6, 0.8, 3), -- 5分钟正念
(7, 4, 0.7, 4), -- 古典音乐

-- 压力 -> 多种技术组合
(8, 2, 1.0, 1), -- 方形呼吸法
(8, 7, 0.9, 2), -- 身体扫描
(8, 11, 0.8, 3), -- 温和瑜伽
(8, 13, 0.7, 4), -- 思维记录

-- 悲伤 -> 激活和认知技术
(2, 5, 1.0, 1), -- 欢快音乐
(2, 10, 0.9, 2), -- 快速锻炼
(2, 14, 0.8, 3), -- 感恩练习
(2, 8, 0.7, 4), -- 慈爱冥想

-- 愤怒 -> 冷静和释放技术
(3, 3, 1.0, 1), -- 腹式深呼吸
(3, 12, 0.9, 2), -- 行走冥想
(3, 11, 0.8, 3), -- 温和瑜伽
(3, 15, 0.7, 4), -- 10-10-10法则

-- 快乐增强 -> 积极技术
(1, 5, 0.9, 1), -- 欢快音乐
(1, 10, 0.8, 2), -- 快速锻炼
(1, 14, 1.0, 3), -- 感恩练习
(1, 8, 0.7, 4); -- 慈爱冥想