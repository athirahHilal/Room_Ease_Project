import { StyleSheet } from 'react-native';
import ctheme from '../styles/theme'; 

const tabView = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
  },
  indicator: {
    height: 2,
    backgroundColor: ctheme.primary, 
  },
  label: {
    fontSize: 14,
    color: ctheme.primary, 
  }
});

export default tabView;
