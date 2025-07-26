import { navigate } from '../hooks/RootNavigation.ts';

export function handleNotificationNavigation(data: any) {
    const screen = data?.screen;
    const id = data?.id || data?.chatId;
    
    console.log('handleNotificationNavigation', screen, id)
    
    switch (screen) {
        case 'MessageScreen':
        case 'ChatDetails':
            navigate('ChatDetailsTab', {
                screen: 'Chat',
                params: { chatId: id, user: JSON.parse(data?.user) },
            });
            break;
        
        case 'ShowJob':
            navigate('MainTabs', {
                screen: 'Jobs',
                params: {
                    screen: 'ShowJob',
                    params: { id },
                },
            });
            break;
        
        case 'ApplicationDetails':
            navigate('MainTabs', {
                screen: 'Jobs',
                params: {
                    screen: 'ApplicationDetails',
                    params: { id },
                },
            });
            break;
            
        case 'ApplyForm':
            navigate('MainTabs', {
                screen: 'Jobs',
                params: {
                    screen: 'ApplyForm',
                    params: { id },
                },
            });
            break;
        default:
            navigate('Home');
    }
}

//
// navigate('ChatDetailsTab', {
//     screen: 'Chat',
//     params: { chatId: item.id, user: other_user },
// })