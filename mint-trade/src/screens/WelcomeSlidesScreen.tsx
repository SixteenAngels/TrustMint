import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

interface WelcomeSlidesScreenProps {
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Buy & Sell Ghana Stocks Seamlessly',
    description: 'Trade stocks from MTN, GCB Bank, GOIL, and other leading Ghanaian companies with just a few taps.',
    icon: '📈',
    color: colors.primary,
  },
  {
    id: 2,
    title: 'Track Live Market Updates Instantly',
    description: 'Get real-time price updates from the Ghana Stock Exchange and never miss a market opportunity.',
    icon: '📊',
    color: colors.accent,
  },
  {
    id: 3,
    title: 'Secure Your Account with Verified Number',
    description: 'Your phone number verification ensures a safe and secure trading experience for all users.',
    icon: '🔒',
    color: colors.success,
  },
];

export const WelcomeSlidesScreen: React.FC<WelcomeSlidesScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
      setCurrentSlide(nextSlide);
    } else {
      onComplete();
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      scrollViewRef.current?.scrollTo({
        x: prevSlide * width,
        animated: true,
      });
      setCurrentSlide(prevSlide);
    }
  };

  const renderSlide = (slide: typeof slides[0], index: number) => (
    <View key={slide.id} style={styles.slide}>
      <Animated.View
        style={[
          styles.slideContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>
        
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentSlide ? colors.primary : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {slides.map(renderSlide)}
      </ScrollView>

      {renderPagination()}

      <View style={styles.buttonContainer}>
        {currentSlide > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousSlide}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={goToNextSlide}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  nextButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
});