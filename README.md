# Intelligence Query Engine (anaell/task-2)

---

## Overview

**Project**: Intelligence Query Engine  
**Repository**: `anaell/task-2`  
**Purpose**: Turn an existing backend that collects and stores profile data into a production-ready, queryable intelligence API. Core capabilities include **advanced filtering**, **combined filters**, **sorting**, **pagination**, and a **deterministic rule‑based natural language query parser** (no AI/LLMs).

---

### Features

- **Advanced filtering** by gender, age, age group, country, and confidence thresholds.
- **Combined filters** applied with logical AND.
- **Sorting** by `age`, `created_at`, or `gender_probability`.
- **Pagination** with `page` and `limit` (default `limit = 10`, max `50`).
- **Natural language query endpoint** that converts plain English into structured filters using deterministic rules only.
- **Strict, consistent error responses** and UTC ISO 8601 timestamps.
- **CORS** enabled: `Access-Control-Allow-Origin: *`.

---

#### Quick start

```bash
# clone
git clone https://github.com/anaell/task-2.git
cd task-2

# install
npm install

# configure environment variables (DB connection, etc.)
# run migrations and seed
npm run migrate
npm run seed

# start server
npm run start
```

---

#### Database schema

**Table**: `profiles` (must match exactly)

| **Field**               | **Type**         | **Notes**                      |
| ----------------------- | ---------------- | ------------------------------ |
| **id**                  | UUID v7          | Primary key                    |
| **name**                | VARCHAR + UNIQUE | Person's full name             |
| **gender**              | VARCHAR          | "male" or "female"             |
| **gender_probability**  | FLOAT            | Confidence score               |
| **age**                 | INT              | Exact age                      |
| **age_group**           | VARCHAR          | child, teenager, adult, senior |
| **country_id**          | VARCHAR(2)       | ISO code (NG, AO, etc.)        |
| **country_name**        | VARCHAR          | Full country name              |
| **country_probability** | FLOAT            | Confidence score               |
| **created_at**          | TIMESTAMP        | Auto-generated (UTC ISO 8601)  |

## Notes

- All IDs must be **UUID v7**.
- All timestamps must be **UTC ISO 8601**.
- Use unique constraints or upsert logic to prevent duplicate records when seeding.

---

### Data seeding

- Seed the database with the provided **2026 profiles** dataset.
- Re-running the seed **must not** create duplicates (use `ON CONFLICT` upsert or equivalent).
- Verify seeding:

```sql
SELECT COUNT(*) FROM profiles;
-- should return 2026
```

---

#### API reference

**Base path**: `/api/profiles`

##### GET /api/profiles

Returns filtered, sorted, paginated profiles.

## Query parameters

- `gender` — `male` | `female`
- `age_group` — `child` | `teenager` | `adult` | `senior`
- `country_id` — ISO 2-letter code (e.g., `NG`, `AO`)
- `min_age` — integer
- `max_age` — integer
- `min_gender_probability` — float
- `min_country_probability` — float
- `sort_by` — `age` | `created_at` | `gender_probability`
- `order` — `asc` | `desc`
- `page` — integer (default: 1)
- `limit` — integer (default: 10, max: 50)

## Success response

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": [
    /* profile objects */
  ]
}
```

### GET /api/profiles/search

Natural language query endpoint. Accepts `q` plus `page` and `limit`.

## Example

```api request
GET /api/profiles/search?q=young males from nigeria&page=1&limit=10
```

## Behavior

- Deterministic rule-based parsing only (no AI).
- Converts parsed values into the same filter set used by `/api/profiles`.
- Pagination applies.

---

### Natural language parsing rules

- **Normalization**: Lowercase and trim input.
- **Gender detection**: `male` or `female`. If both appear, gender is ignored.
- **Age interpretation**
  - Numeric rules: `above <n>` → `min_age = n`; `below <n>` → `max_age = n`.
  - Keyword mapping: `young` → `min_age = 16`, `max_age = 24` (applies only if no explicit numeric age present).
- **Age group mapping**: `child`, `teenager`, `adult`, `senior`.
- **Country detection**
  - Alias matching (e.g., `usa`, `america` → `US`; `uk`, `britain` → `GB`).
  - Official names via `i18n-iso-countries` with word-boundary matching to avoid false positives.
- **Precedence**
  - Explicit numeric age rules override keyword-based mappings.
  - Multiple filters combine with logical AND.
- **Uninterpretable queries**
  - Return:

  ```json
  { "status": "error", "message": "Unable to interpret query" }
  ```

---

#### Filtering, sorting, pagination behavior

- Filters are **combinable** and applied with logical **AND**.
- Sorting:
  - `sort_by` accepts `age`, `created_at`, `gender_probability`.
  - `order` accepts `asc` or `desc`.
  - Default sort: `created_at desc` (unless otherwise configured).
- Pagination:
  - `page` default: `1`
  - `limit` default: `10`, maximum: `50`
  - Response includes `page`, `limit`, and `total`.

---

#### Validation and error responses

All errors follow this structure:

```json
{ "status": "error", "message": "<error message>" }
```

## Common status codes

- `400 Bad Request` — Missing or empty parameter
- `422 Unprocessable Entity` — Invalid parameter type or value
- `404 Not Found` — Profile not found
- `500 / 502` — Server failure

## Invalid query parameters

```json
{ "status": "error", "message": "Invalid query parameters" }
```

## Natural language parse failure

```json
{ "status": "error", "message": "Unable to interpret query" }
```

---

### Performance notes

- The system must handle **2026 records** efficiently.
- Add indexes on `country_id`, `age`, `gender`, and `created_at`.
- Use parameterized queries and avoid unnecessary full-table scans.
- Prefer keyset pagination for large offsets if performance becomes an issue.

---

#### Examples

## Filter + Sort + Paginate

```api request
GET /api/profiles?gender=female&min_age=30&sort_by=age&order=desc&page=2&limit=20
```

## Natural Language

```api request
GET /api/profiles/search?q=females above 30&page=1&limit=10
```

## Error Example

```api request
GET /api/profiles?min_age=abc
Response:
{ "status": "error", "message": "Invalid query parameters" }
```

---

### Testing checklist

- [ ] Database seeded with 2026 profiles
- [ ] `GET /api/profiles` supports all filters and combinations
- [ ] Sorting works for all `sort_by` fields and both `order` values
- [ ] Pagination respects `page`, `limit`, and `max limit = 50`
- [ ] `GET /api/profiles/search` interprets example queries correctly
- [ ] Invalid parameters return `422` or `400` with the correct error structure
- [ ] Uninterpretable natural language queries return the specified error object
- [ ] CORS header present on all responses
- [ ] Timestamps are UTC ISO 8601; IDs are UUID v7

---

#### Implementation notes and suggestions

- Use `i18n-iso-countries` for robust country name → ISO code mapping and apply word-boundary regex to avoid false matches.
- Use regex like `/above (\d+)/` and `/below (\d+)/` for numeric age extraction; extend to support `over`, `under`, `>`, `<` if desired.
- Ensure seeding uses upsert logic keyed on `name` or `id` to avoid duplicates.
- Validate `min_age` ≤ `max_age` when both are present; return a `422` if invalid.
- Keep natural language parsing deterministic and unit-tested (cover edge cases and ambiguous inputs).

---

#### Contact and repository

**Repository**: `https://github.com/anaell/task-2`
