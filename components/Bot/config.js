import { createChatBotMessage } from 'react-chatbot-kit';
import Avatar from './Avatar';
import StartBtn from './StartBtn';
import StartSlow from './StartSlow';
// import data from './data';
import DipslayImage from './DisplayImage';



const config = {
    botName: "Dr Dheeraj Dubey ",
    initialMessages: [createChatBotMessage(`Hello , Dr Dheeraj Dubey welcomes you !`, {
        // widget: "startBtn"
    })],
    customComponents: {
        botAvatar: (props) => <Avatar {...props} />,
        // userAvatar: (props) => <Avatar {...props} />,
    },
    // state: {
    //     checker: null,
    //     data,
    //     userData: {
    //         name: "",
    //         age: 0,
    //         category: "",
    //         product: {
    //             name: "",
    //             link: "",
    //             imageUrl: ""
    //         }
    //     }
    // },
    // widgets: [
    //     {
    //         widgetName: "startBtn",
    //         widgetFunc: (props) => <StartBtn {...props} />,
    //     },
    //     {
    //         widgetName: "startSlow",
    //         widgetFunc: (props) => <StartSlow {...props} />,
    //     },
    //     {
    //         widgetName: "finalImage",
    //         widgetFunc: (props) => <DipslayImage {...props} />,
    //     },
    // ]
};

export default config;



