import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  h1: {
    fontFamily: 'Syne_700Bold',
    fontSize: 28,
    color: '#F0F0F8',
  },
  h2: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    color: '#F0F0F8',
  },
  h3: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 17,
    color: '#F0F0F8',
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#F0F0F8',
  },
  bodyBold: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#F0F0F8',
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(240,240,248,0.45)',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(240,240,248,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
