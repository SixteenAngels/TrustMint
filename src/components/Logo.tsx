import React from 'react';
import { View, Image, StyleSheet, ImageStyle, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', style, imageStyle }) => {
  const sizeMap = {
    small: { width: 60, height: 60 },
    medium: { width: 100, height: 100 },
    large: { width: 140, height: 140 },
  };

  return (
    <View style={[styles.container, { padding: 0.5 }, style]}>
      <Image
        source={require('../../assets/icon.png')}
        style={[
          sizeMap[size],
          styles.image,
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

