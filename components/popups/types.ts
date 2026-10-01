export interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFoundingMembers?: () => void;
  language?: string;
}
