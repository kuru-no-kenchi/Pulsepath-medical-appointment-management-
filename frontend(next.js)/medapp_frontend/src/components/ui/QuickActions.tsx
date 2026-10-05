import { IconType } from "react-icons";
import { FiZap } from "react-icons/fi";

export interface QuickAction {
  label: string;
  icon: IconType;
  onClick: () => void;
  color?: string;
}
interface QuickActionCardProps {
  title?: string;
  actions: QuickAction[];
  icon?: IconType;
}
export default function QuickActionCard({
  title = "Quick Actions",
  icon : Icon = FiZap,
  actions,
}: QuickActionCardProps) {
  return (
    <div className="space-y-4 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-900 to-green-400 flex items-center justify-between px-4 py-2 border-b">
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
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="
                group
                w-full
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-2
                transition-all
                duration-200
                hover:bg-gradient-to-r
                hover:from-slate-50
                hover:to-white
                hover:shadow-sm
                hover:-translate-y-0.5
              "
          >
            <div
              className={`
                  w-11 h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-200
                  group-hover:scale-105
                  ${
                    action.color ??
                    "bg-green-50 text-green-600"
                  }
                `}
            >
              <Icon size={18} />
            </div>

            <div className="flex-1 text-left">
              <p className="font-medium text-gray-800">{action.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
