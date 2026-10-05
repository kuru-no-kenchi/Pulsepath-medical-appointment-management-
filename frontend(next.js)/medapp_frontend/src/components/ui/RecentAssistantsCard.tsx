import { IconType } from "react-icons";
import { ReactNode } from "react";

interface CardProps {
  title: string;
  icon?: IconType;
  children: ReactNode;
  className?: string;
}
export default function RecentAssistantCard({
  title,
  icon: Icon,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-purple-900 to-violet-500 flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-1">
          {Icon && (
            <div className="w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center">
              <Icon size={20} />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-white text-gray-800">{title}</h2>
          </div>
        </div>
      </div>
      <div className="px-4 py-1 mb-3">{children}</div>
    </div>
  );
}
