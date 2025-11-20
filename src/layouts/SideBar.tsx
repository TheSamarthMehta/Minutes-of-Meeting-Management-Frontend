import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  BarChart3,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

interface SideBarProps {
  onClose?: () => void;
}

interface NavItem {
  path?: string;
  label: string;
  icon: any;
  roles: string[];
  badge?: string;
  badgeColor?: string;
  description?: string;
  isExpandable?: boolean;
  children?: NavItem[];
}

const SideBar: React.FC<SideBarProps> = ({ onClose }) => {
  const { user, logout } = useAuth() as any;
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key to close sidebar
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const hasAnyRole = (roles: string[]) => {
    return roles.includes(user?.role || '');
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isExpanded = (label: string) => {
    return expandedSections[label] || false;
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'Admin':
        return Shield;
      case 'Manager':
        return Briefcase;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Manager', 'Staff'],
      description: 'Overview & Analytics'
    },
    {
      path: '/master-config',
      label: 'Master Config',
      icon: Settings,
      roles: ['Admin'],
      badge: 'Admin',
      badgeColor: 'bg-purple-100 text-purple-700',
      description: 'System Configuration'
    },
    {
      path: '/staff',
      label: 'Staff Management',
      icon: Users,
      roles: ['Admin', 'Manager'],
      description: 'Manage Team Members'
    },
    {
      path: '/meetings',
      label: 'Meetings',
      icon: Calendar,
      roles: ['Admin', 'Manager', 'Staff'],
      description: 'Schedule & Organize'
    },
    {
      path: '/attendance',
      label: 'Attendance',
      icon: CheckSquare,
      roles: ['Admin', 'Manager', 'Staff'],
      description: 'Track Participation'
    },
    {
      path: '/documents',
      label: 'Documents',
      icon: FileText,
      roles: ['Admin', 'Manager', 'Staff'],
      description: 'Files & Minutes'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['Admin', 'Manager'],
      description: 'Analytics & Insights'
    }
  ];

  const RoleIcon = getRoleIcon();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 ring-2 ring-teal-400/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">MOM</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
            Navigation
          </p>
        </div>
        {navItems.map((item) => {
          if (!hasAnyRole(item.roles)) return null;

          const Icon = item.icon;
          const itemKey = item.path || item.label;
          const isActive = item.path ? location.pathname === item.path : false;
          const isHovered = hoveredItem === itemKey;
          const expanded = isExpanded(item.label);
          const hasActiveChild = item.children?.some(child => child.path === location.pathname);

          // If item is expandable (has children)
          if (item.isExpandable && item.children) {
            return (
              <div key={itemKey}>
                <button
                  onClick={() => toggleSection(item.label)}
                  onMouseEnter={() => setHoveredItem(itemKey)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    hasActiveChild || expanded
                      ? 'bg-gray-100 dark:bg-gray-800/70 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                      hasActiveChild || expanded
                        ? 'bg-teal-100 dark:bg-white/10 shadow-inner'
                        : 'bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${hasActiveChild || expanded ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`} />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-md ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {(isHovered || expanded) && item.description && (
                      <p className={`text-xs mt-0.5 truncate text-gray-500 dark:text-gray-500`}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expanded ? 'rotate-180 text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-500'
                    }`}
                  />
                </button>

                {/* Expandable children */}
                {expanded && item.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      if (!hasAnyRole(child.roles)) return null;
                      
                      const ChildIcon = child.icon;
                      const childActive = child.path === location.pathname;
                      const childHovered = hoveredItem === child.path;

                      return (
                        <NavLink
                          key={child.path}
                          to={child.path!}
                          onClick={() => {
                            onClose?.();
                          }}
                          onMouseEnter={() => setHoveredItem(child.path!)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                            childActive
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {childActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                          )}

                          <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                            childActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800/30'
                          }`}>
                            <ChildIcon className={`w-4 h-4 ${childActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                          </div>

                          <span className={`text-sm flex-1 ${childActive ? 'font-medium' : ''}`}>
                            {child.label}
                          </span>

                          {childActive && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular non-expandable item
          return (
            <NavLink
              key={itemKey}
              to={item.path!}
              onClick={() => {
                onClose?.();
              }}
              onMouseEnter={() => setHoveredItem(itemKey)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
              )}

              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 shadow-inner'
                    : 'bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                  {item.badge && !isActive && (
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {(isHovered || isActive) && item.description && (
                  <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-500'}`}>
                    {item.description}
                  </p>
                )}
              </div>

              <ChevronRight
                className={`w-4 h-4 transition-all duration-200 ${
                  isActive
                    ? 'opacity-100 translate-x-0 text-white'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-500 dark:text-gray-500'
                }`}
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-3 space-y-2 border-t border-gray-200 dark:border-gray-700/50">
        {/* Quick Stats */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Today</p>
              <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="border-x border-gray-200 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-500">Week</p>
              <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                Week {Math.ceil((new Date().getDate()) / 7)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Year</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
        }
      `}</style>
    </div>
  );
};

export default SideBar;
