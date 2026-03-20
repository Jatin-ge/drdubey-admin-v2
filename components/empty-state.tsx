import { FileX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="h-full p-20 flex flex-col items-center justify-center">
      <div className="relative h-72 w-72 flex items-center justify-center">
        <FileX className="h-20 w-20 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-center">{title}</h2>
      <p className="text-muted-foreground text-center mt-2">{description}</p>
    </div>
  );
}; 