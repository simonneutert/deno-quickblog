export interface PostInfo {
  postKey: string;
  postDate: string;
  title: string;
  content: string;
  url: string;
  nextUrl: string | null;
  prevUrl: string | null;
}
