ALTER TABLE t_p9930243_gpu_tracking_site.users 
ADD COLUMN student_group VARCHAR(50);

ALTER TABLE t_p9930243_gpu_tracking_site.queue 
ADD COLUMN student_group VARCHAR(50);

UPDATE t_p9930243_gpu_tracking_site.users 
SET student_group = 'Группа 1' 
WHERE student_group IS NULL;

UPDATE t_p9930243_gpu_tracking_site.queue 
SET student_group = 'Группа 1' 
WHERE student_group IS NULL;