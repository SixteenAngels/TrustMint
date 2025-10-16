import React from 'react';
import { Text, StyleSheet, Platform, StyleProp, TextStyle } from 'react-native';
import { colors } from '../styles/colors';

type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

interface SFSymbolProps {
  name: string;
  size?: number;
  color?: string;
  weight?: FontWeight;
  style?: StyleProp<TextStyle>;
}

// SF Symbols fallback mapping for React Native
const SF_SYMBOLS_MAP: { [key: string]: string } = {
  // Navigation
  'house': '🏠',
  'house.fill': '🏠',
  'creditcard': '💳',
  'creditcard.fill': '💳',
  'chart.line.uptrend.xyaxis': '📈',
  'chart.line.uptrend.xyaxis.circle': '📈',
  'briefcase': '💼',
  'briefcase.fill': '💼',
  'person.circle': '👤',
  'person.circle.fill': '👤',
  
  // Financial
  'dollarsign.circle': '💰',
  'dollarsign.circle.fill': '💰',
  'banknote': '💵',
  'banknote.fill': '💵',
  'chart.bar': '📊',
  'chart.bar.fill': '📊',
  'chart.pie': '🥧',
  'chart.pie.fill': '🥧',
  
  // Actions
  'plus': '+',
  'plus.circle': '➕',
  'plus.circle.fill': '➕',
  'minus': '−',
  'minus.circle': '➖',
  'minus.circle.fill': '➖',
  'arrow.up': '↑',
  'arrow.down': '↓',
  'arrow.left': '←',
  'arrow.right': '→',
  'arrow.clockwise': '🔄',
  'arrow.counterclockwise': '🔄',
  
  // Communication
  'message': '💬',
  'message.fill': '💬',
  'bell': '🔔',
  'bell.fill': '🔔',
  'envelope': '✉️',
  'envelope.fill': '✉️',
  'phone': '📞',
  'phone.fill': '📞',
  
  // Social
  'person.2': '👥',
  'person.2.fill': '👥',
  'person.3': '👥',
  'person.3.fill': '👥',
  'heart': '❤️',
  'heart.fill': '❤️',
  'star': '⭐',
  'star.fill': '⭐',
  
  // System
  'gear': '⚙️',
  'gear.circle': '⚙️',
  'gear.circle.fill': '⚙️',
  'wrench.and.screwdriver': '🔧',
  'wrench.and.screwdriver.fill': '🔧',
  'questionmark.circle': '❓',
  'questionmark.circle.fill': '❓',
  'exclamationmark.triangle': '⚠️',
  'exclamationmark.triangle.fill': '⚠️',
  'checkmark.circle': '✅',
  'checkmark.circle.fill': '✅',
  'xmark': '❌',
  'xmark.circle': '❌',
  'xmark.circle.fill': '❌',
  
  // Media
  'camera': '📷',
  'camera.fill': '📷',
  'photo': '📸',
  'photo.fill': '📸',
  'video': '📹',
  'video.fill': '📹',
  'mic': '🎤',
  'mic.fill': '🎤',
  'speaker': '🔊',
  'speaker.fill': '🔊',
  'speaker.slash': '🔇',
  'speaker.slash.fill': '🔇',
  
  // Time
  'clock': '🕐',
  'clock.fill': '🕐',
  'calendar': '📅',
  'calendar.circle': '📅',
  'calendar.circle.fill': '📅',
  'timer': '⏱️',
  'timer.circle': '⏱️',
  'timer.circle.fill': '⏱️',
  
  // Weather
  'sun.max': '☀️',
  'sun.max.fill': '☀️',
  'cloud': '☁️',
  'cloud.fill': '☁️',
  'cloud.rain': '🌧️',
  'cloud.rain.fill': '🌧️',
  'cloud.snow': '🌨️',
  'cloud.snow.fill': '🌨️',
  'cloud.bolt': '⛈️',
  'cloud.bolt.fill': '⛈️',
  
  // Objects
  'car': '🚗',
  'car.fill': '🚗',
  'house.lodge': '🏡',
  'house.lodge.fill': '🏡',
  'building.2': '🏢',
  'building.2.fill': '🏢',
  'airplane': '✈️',
  'airplane.circle': '✈️',
  'airplane.circle.fill': '✈️',
  'train.side.front.car': '🚅',
  'bus': '🚌',
  'bus.fill': '🚌',
  'bicycle': '🚲',
  'bicycle.circle': '🚲',
  'bicycle.circle.fill': '🚲',
  
  // Food
  'fork.knife': '🍴',
  'fork.knife.circle': '🍴',
  'fork.knife.circle.fill': '🍴',
  'cup.and.saucer': '☕',
  'cup.and.saucer.fill': '☕',
  'wineglass': '🍷',
  'wineglass.fill': '🍷',
  
  // Health
  'heart.text.square': '❤️',
  'heart.text.square.fill': '❤️',
  'cross.case': '🏥',
  'cross.case.fill': '🏥',
  'pills': '💊',
  'pills.fill': '💊',
  'bandage': '🩹',
  'bandage.fill': '🩹',
  
  // Education
  'book': '📖',
  'book.fill': '📖',
  'book.closed': '📚',
  'book.closed.fill': '📚',
  'graduationcap': '🎓',
  'graduationcap.fill': '🎓',
  'pencil': '✏️',
  'pencil.circle': '✏️',
  'pencil.circle.fill': '✏️',
  
  // Technology
  'laptopcomputer': '💻',
  'desktopcomputer': '🖥️',
  'iphone': '📱',
  'ipad': '📱',
  'applewatch': '⌚',
  'airpods': '🎧',
  'airpods.gen3': '🎧',
  'airpods.max': '🎧',
  'headphones': '🎧',
  'headphones.circle': '🎧',
  'headphones.circle.fill': '🎧',
  
  // Shopping
  'cart': '🛒',
  'cart.fill': '🛒',
  'bag': '👜',
  'bag.fill': '👜',
  'gift': '🎁',
  'gift.fill': '🎁',
  'tag': '🏷️',
  'tag.fill': '🏷️',
  'tag.circle': '🏷️',
  'tag.circle.fill': '🏷️',
  
  // Sports
  'sportscourt': '🏟️',
  'sportscourt.fill': '🏟️',
  'soccerball': '⚽',
  'soccerball.circle': '⚽',
  'soccerball.circle.fill': '⚽',
  'basketball': '🏀',
  'basketball.circle': '🏀',
  'basketball.circle.fill': '🏀',
  'tennisball': '🎾',
  'tennisball.circle': '🎾',
  'tennisball.circle.fill': '🎾',
  
  // Games
  'gamecontroller': '🎮',
  'gamecontroller.fill': '🎮',
  'dice': '🎲',
  'dice.fill': '🎲',
  'puzzlepiece': '🧩',
  'puzzlepiece.fill': '🧩',
  'puzzlepiece.extension': '🧩',
  'puzzlepiece.extension.fill': '🧩',
  
  // Nature
  'leaf': '🍃',
  'leaf.fill': '🍃',
  'tree': '🌳',
  'tree.fill': '🌳',
  'flower': '🌸',
  'flower.fill': '🌸',
  'butterfly': '🦋',
  'butterfly.fill': '🦋',
  'bird': '🐦',
  'bird.fill': '🐦',
  'fish': '🐟',
  'fish.fill': '🐟',
  'pawprint': '🐾',
  'pawprint.fill': '🐾',
  'pawprint.circle': '🐾',
  'pawprint.circle.fill': '🐾',
  
  // Default
  'default': '❓',
};

export const SFSymbol: React.FC<SFSymbolProps> = ({
  name,
  size = 24,
  color = colors.textPrimary,
  weight = 'regular',
  style,
}) => {
  const symbol = SF_SYMBOLS_MAP[name] || SF_SYMBOLS_MAP['default'];
  
  return (
    <Text
      style={[
        styles.symbol,
        {
          fontSize: size,
          color: color,
          fontWeight: getFontWeight(weight),
        },
        style,
      ]}
    >
      {symbol}
    </Text>
  );
};

const getFontWeight = (weight: FontWeight): '300' | '400' | '500' | '600' | '700' => {
  switch (weight) {
    case 'light': return '300';
    case 'regular': return '400';
    case 'medium': return '500';
    case 'semibold': return '600';
    case 'bold': return '700';
    default: return '400';
  }
};

const styles = StyleSheet.create({
  symbol: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default SFSymbol;