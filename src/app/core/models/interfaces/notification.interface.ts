export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface NotificationInterface {
  id: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'ALERT' | 'ANNOUNCEMENT' | 'INFO' | 'STATUS_CHANGE' | 'PENDING';
  userId?: string;
  status: NotificationStatus;
  forAll: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationEvent {
  id: string;
  type: 'new' | 'updated' | 'deleted';
  notificationType?: NotificationInterface['type'];
  forAll?: boolean;
  userId?: string;
}
