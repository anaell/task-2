import { format } from '@fast-csv/format';

const CSV_HEADERS = [
  'id',
  'name',
  'gender',
  'gender_probability',
  'age',
  'age_group',
  'country_id',
  'country_name',
  'country_probability',
  'created_at',
];

const streamCSV = format({ headers: CSV_HEADERS, delimiter: ',' });
