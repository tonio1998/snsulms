import mitt from 'mitt';

type NotificationEvents = {
    newMessage: any;
};

const emitter = mitt<NotificationEvents>();

export default emitter;
