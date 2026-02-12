export interface PublicFlower {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  color: string; // Tailwind color class or hex
  type: number; // 1, 2, or 3 for different SVG shapes
  scale: number;
  bloomDelay: number;
}

export interface MessageData {
  sender: string;
  recipient: string;
  content: string;
}

export interface PrivateMessage {
  sender: string;
  recipient: string;
  content: string;
  token: string;
  timestamp: number;
  flowerId: string;
}

// Combined type for the view view
export interface MessageViewData extends PrivateMessage {
  flower: PublicFlower;
}

export interface CreateMessageResponse {
  token: string;
  flower: PublicFlower;
}
