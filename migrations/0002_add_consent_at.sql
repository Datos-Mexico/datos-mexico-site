-- Consentimiento al aviso de privacidad demostrable a nivel BD.
--
-- LFPDPPP exige que el consentimiento sea informado, manifiesto y
-- DEMOSTRABLE. El acto manifiesto vive en el formulario (checkbox
-- explícito requerido para enviar). El registro demostrable vive
-- aquí: timestamp ISO8601 UTC del momento en que la fila se inserta
-- con el flag `consented: true` presente en el body del POST.
--
-- Sin esta columna, la única evidencia sería la existencia de la
-- fila — débil ante una auditoría. Con la columna, queda inscrito
-- el momento exacto en que el usuario consintió.

ALTER TABLE subscribers
  ADD COLUMN consent_at TEXT;
