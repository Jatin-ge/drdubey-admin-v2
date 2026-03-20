import React from 'react';

const MessageParser = ({ children, actions }) => {
    // console.log(children.props.state)
    const { checker } = children.props.state;
    const parse = (message) => {
        const lowerCaseMessage = message.toLowerCase()
    
        if (lowerCaseMessage.includes("hello")) {
            actions.greet(message)
        }
        if (lowerCaseMessage.includes("hi")) {
            actions.greet(message)
        }
        if (lowerCaseMessage.includes("recover" || "recovery") ) {
            actions.recoveryMessage(message)
        }
        if (lowerCaseMessage.includes("pain") ) {
            actions.painMessage(message)
        }
        if (lowerCaseMessage.includes("walking") ) {
            actions.walkingMessage(message)
        }
        if (lowerCaseMessage.includes("restriction" || "restrictions on activities" || "movements")  ) {
            actions.restrictionsMessage(message)
        }
        if (lowerCaseMessage.includes( "how long" ||"how long will  knee replacement last " || "another surgery" || "longevity")  ) {
            actions.longevityMessage(message)
        }
        if (lowerCaseMessage.includes("therapy" ||  "physical therapy" )) {
            actions.therapyMessage(message)
        }
        if (lowerCaseMessage.includes("infection" ||  "prevent infection" ||" take care of the surgical site " )  ) {
            actions.preventMessage(message)
        }
        if (lowerCaseMessage.includes( "return to work" || "work" ||  "resume normal activities" )  ) {
            actions.workMessage(message)
        }
        if (lowerCaseMessage.includes( "complications" ||" signs of complications" )  ) {
            actions.complicationsMessage(message)
        }
        if (lowerCaseMessage.includes( "travel" ||"air travel" )  ) {
            actions.travelMessage(message)
        }
        if (lowerCaseMessage.includes( "special equipment")  ) {
            actions.equipmentMessage(message)
        }
        
        if (lowerCaseMessage.includes( "sex" || "sexual activities")  ) {
            actions.sexualMessage(message)
        }
        
        
    }
    return (
        <div>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    parse: parse,
                    actions,
                });
            })}
        </div>
    );
};

export default MessageParser;

