/**
 * Represents the UserData associated with a Jellyfin item.
 */
export interface JellyfinUserData {
  PlaybackPositionTicks: number;
  PlayCount: number;
  IsFavorite: boolean;
  Played: boolean;
  Key: string;
  ItemId: string;
}

/**
 * Represents the ImageTags for a Jellyfin item.
 * The keys are image types (e.g., "Primary", "Thumb") and values are string IDs.
 * It can be empty if no images are available.
 */
export interface JellyfinImageTags {
  Primary?: string;
  Thumb?: string;
  [key: string]: string | undefined;
}

/**
 * Represents the ImageBlurHashes for a Jellyfin item.
 * This is a nested object where keys are image types, and values are objects
 * containing image ID to blur hash mappings.
 */
export interface JellyfinImageBlurHashes {
  Primary?: {
    [key: string]: string;
  };
  Thumb?: {
    [key: string]: string;
  };
  [key: string]: { [key: string]: string } | undefined;
}

/**
 * Represents a single item returned by the Jellyfin API,
 * specifically for library root folders or collections in this context.
 */
export interface JellyfinItem {
  Name: string;
  ServerId: string;
  Id: string;
  ChannelId: string | null;
  IsFolder: boolean;
  Type: "CollectionFolder" | "ManualPlaylistsFolder" | string;
  UserData: JellyfinUserData;
  CollectionType?: "boxsets" | "music" | "movies" | "tvshows" | "playlists" | string;
  ImageTags: JellyfinImageTags;
  BackdropImageTags: string[];
  ImageBlurHashes: JellyfinImageBlurHashes;
  LocationType: "FileSystem" | string;
  MediaType: "Unknown" | string;
}

/**
 * Represents the overall response structure for fetching a list of Jellyfin items.
 */
export interface JellyfinItemsResponse {
  Items: JellyfinItem[];
  TotalRecordCount: number;
  StartIndex: number;
}

export interface JellyfinServer {
  Id: string
  LocalAddress: string
  ServerName: string
  Version: string
  ProductName: string
  OperatingSystem: string
  StartupWizardCompleted: boolean
}