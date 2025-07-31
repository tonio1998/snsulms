import { navigate } from '../hooks/RootNavigation.ts';

export function handleNotificationNavigation(data: any) {
    const screen = data?.screen;
    const id = data?.id || data?.postId || data?.ClassID;
    
    switch (screen) {
        case 'WallComments':
            navigate('WallComments', { postId: id, commentable_id: id });
            break;
        
        case 'Wall':
            navigate('ClassDetails', {
                screen: 'Wall',
                ClassID: id,
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
    }
}

//
// navigate('ChatDetailsTab', {
//     screen: 'Chat',
//     params: { chatId: item.id, user: other_user },
// })