-- Crear bucket de almacenamiento para audio (Público)
insert into storage.buckets (id, name, public)
values ('ghost-audio', 'ghost-audio', true);
-- Política de seguridad: Permitir lectura pública
create policy "Public Access" on storage.objects for
select using (bucket_id = 'ghost-audio');
-- Política de seguridad: Permitir subida a cualquiera (para demo, restringir en prod)
create policy "Public Upload" on storage.objects for
insert with check (bucket_id = 'ghost-audio');
-- NOTA: Para producción real, cambiar "Public Upload" para requerir autenticación.