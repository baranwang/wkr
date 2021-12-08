interface RoomRules {
  roomID: string
  keywords: string[];
  keywordsMode: 'include' | 'all'
  members: string[];
  content: string;
}