import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function useBlockNavigation() {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    navigation.setOptions?.({
      gestureEnabled: false,
    });

    return () => {
      backHandler.remove();
    };
  }, [navigation]);
}
