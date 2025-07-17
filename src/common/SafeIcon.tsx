import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { FiAlertTriangle } from 'react-icons/fi';

import { IconType } from 'react-icons';

interface SafeIconProps extends React.SVGProps<SVGSVGElement> {
  icon?: IconType;
  name?: string;
}

const SafeIcon: React.FC<SafeIconProps> = ({ icon, name, ...props }) => {
  let IconComponent;
  try {
    IconComponent = icon || (name && (FiIcons as any)[`Fi${name}`]);
  } catch (e) {
    IconComponent = null;
  }

  return IconComponent
    ? React.createElement(IconComponent, props)
    : <FiAlertTriangle {...props} />;
};

export default SafeIcon;