type SqliteDatabase = {
  function: (
    name: string,
    options: { deterministic: boolean },
    implementation: (value: string | null) => string | null,
  ) => unknown;
};

export function registerUnicodeLower(database: SqliteDatabase): void {
  database.function(
    'unicode_lower',
    { deterministic: true },
    (value) => value?.normalize('NFC').toLowerCase() ?? null,
  );
}
