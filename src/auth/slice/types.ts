export interface AuthState {
  userName: string | null
  apiKey: string | null
  userId: string | null
  hostUrl: string | null
}

export interface DeviceInfo {
  deviceName: string | null
  deviceId: string | null
}

export interface LoginRequest {
  username: string
  password: string
}

export interface JellyfinUser { // partial item
  Id: string
  Name: string
}

export interface JellyfinLoginResponse { // partial item
  User: JellyfinUser
  AccessToken: string
}

export interface JellyfinQuickConnectState {
  Authenticated: boolean;
  Secret: string;
  Code: string;
  DeviceId: string;
  DeviceName: string;
  AppName: string;
  AppVersion: string;
  DateAdded: string;
}