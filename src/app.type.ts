export interface GenderizeAPIResponseType {
  count: number;
  probability: number;
  name: string;
  gender: string;
}

export interface AgifyAPIResponseType {
  count: number;
  name: string;
  age: number;
  country_id?: string;
}

export interface NationalizeAPIResponseType {
  count: number;
  name: string;
  country: {
    country_id: string;
    probability: number;
  }[];
}

export interface ProcessPostRequestFunctionType {
  status: string;
  data: {
    id: string;
    name: string;
    gender: string;
    gender_probability: number;
    sample_size: number;
    age: number;
    age_group: string;
    country_id: string;
    country_probability: number;
    created_at: string;
  };
}

export interface userType {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
}

export type createUserType = Omit<userType, 'created_at'>;

export interface fetchUsersWithOptionalFiltersType {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: string;
  country_id: string;
}

export interface seed {
  id: string;
  name: string;
  gender: 'male' | 'female';
  gender_probability: number;
  age: number;
  age_group: 'adult' | 'child' | 'teenager' | 'senior';
  country_id: string;
  country_name: string;
  country_probability: number;
}
[];

// profiles: {
//   name: string;
//   gender: string;
//   gender_probability: number;
//   age: number;
//   age_group: string;
//   country_id: string;
//   country_name: string;
//   country_probability: number;
// }
// [];

export enum Gender {
  male = 'male',
  female = 'female',
}

export enum AgeGroup {
  adult = 'adult',
  child = 'child',
  senior = 'senior',
  teenager = 'teenager',
}

export enum SortBy {
  age = 'age',
  created_at = 'created_at',
  gender_probability = 'gender_probability',
}

export enum Order {
  asc = 'asc',
  desc = 'desc',
}
