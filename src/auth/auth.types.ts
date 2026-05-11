export interface GitHubCallBackService_DataType {
  state: string;
  stored_state: string;
  github_code: string;
  pkce_verifier: string;
}

export enum Role {
  admin = 'admin',
  analyst = 'analyst',
}

export interface JwtPayload {
  id: string;
  role: 'analyst' | 'admin';
}

export interface create_user_object_type {
  id: string;
  github_id: string;
  username: string;
  email: string;
  avatar_url: string;
  is_active: boolean;
  role: 'analyst' | 'admin';
}
