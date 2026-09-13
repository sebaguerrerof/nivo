-- Resultado explícito de una actividad. El motivo permanece privado junto con
-- la actividad y no se incorpora a analytics ni a flujos de IA.
alter table public.activities
  add column not_completed_reason text
    check (not_completed_reason is null or char_length(btrim(not_completed_reason)) between 1 and 500);