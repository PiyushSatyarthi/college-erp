import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'up',
  className,
  ...props 
}: FadeInProps) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // smooth easeOut
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ 
  children, 
  className,
  delayChildren = 0,
  staggerChildren = 0.1
}: { 
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
