import React from 'react';

const ActionProvider = ({ createChatBotMessage, setState, children }) => {

    // const initialAction = () => {
    //     const message = createChatBotMessage('Just type in your name to begin.');
    //     updateState(message, "age")
    // }

    // const afterNameMessage = () => {
    //     const message = createChatBotMessage("Let me know your age so I can suggest the best ride for you.")
    //     updateState(message, "preference")
    // }

    // const afterAgeMessage = () => {
    //     const message = createChatBotMessage("do you lean towards a fast and thrilling ride or prefer a more relaxed and comfortable one?", {
    //         widget: "startSlow"
    //     })
    //     updateState(message)
    // }

    // const finalResult = (name, age, preference, vehicle) => {
    //     const message = createChatBotMessage(`Got it, ${name}! Based on your age ${age} and preference for a ${preference} ride, I recommend the '${vehicle}.' Enjoy the thrill!`, {
    //         widget: "finalImage"
    //     })
    //     updateState(message)
    // }
    const greet = () =>  {
        const greetingMessage = createChatBotMessage("Hi, How can we assist you today? Ask any questions regarding the recovery , replacement, problem regarding walking, pain, restrictions, longetivity of replacement, therapy, compliations, equipment, .")
        updateState(greetingMessage)
      }

    const recoveryMessage = () => {
        const msg = createChatBotMessage("Typically, full recovery can take about 45 to 60 days but you may be able to resume most normal activities within 30 days")
        updateState(msg)
    }
    const walkingMessage = () => {
        const msg = createChatBotMessage("You might start walking with assistance as early as the day of your surgery, gradually increasing over time.")
        updateState(msg)
    }
    const painMessage = () => {
        const msg = createChatBotMessage("Pain is normal but manageable with medications prescribed by your doctor. Ice, elevation, and gentle exercises also help.")
        updateState(msg)
    }
    const restrictionsMessage = () => {
        const msg = createChatBotMessage("A knee replacement can last 25 to 30 years, but this varies.")
        updateState(msg)
    }
    const longevityMessage = () => {
        const msg = createChatBotMessage("replacement can last 25 to 30 years, but this varies.")
        updateState(msg)
    }
    const therapyMessage = () => {
        const msg = createChatBotMessage("Essential for recovery, usually starting a day after surgery to regain movement and strength.")
        updateState(msg)
    }
    const preventMessage = () => {
        const msg = createChatBotMessage("Keep the wound clean and dry, follow your surgeon's instructions for wound care.")
        updateState(msg)
    }
    const workMessage = () => {
        const msg = createChatBotMessage(" Depends on your job, sittiyon you can start after 15 days of surgery but generally between 6 to 8 weeks")
        updateState(msg)
    }
    const complicationsMessage = () => {
        const msg = createChatBotMessage("Watch for increased swelling, redness, wound drainage, or fever, and report to your doctor.")
        updateState(msg)
    }
    const travelMessage = () => {
        const msg = createChatBotMessage("Usually safe after 6 weeks, but confirm with your doctor.")
        updateState(msg)
    }
    const equipmentMessage = () => {
        const msg = createChatBotMessage("Raised toilet seat, shower chair, and handrails can be helpful.")
        updateState(msg)
    }
    const sexualMessage = () => {
        const msg = createChatBotMessage("Generally safe to resume after 6-8 weeks, following your doctor's advice.")
        updateState(msg)
    }

    const updateState = (message, checker) => {
        setState((prev) => ({
            ...prev,
            messages: [...prev.messages, message],
            checker,
        }))
    }

    return (
        <div>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    actions: {
                        greet, 
                        recoveryMessage,
                        walkingMessage,
                        painMessage,
                        restrictionsMessage,
                        longevityMessage,
                        therapyMessage,
                        preventMessage,
                        workMessage,
                        complicationsMessage,
                        travelMessage,
                        equipmentMessage,
                        sexualMessage

                    },
                });
            })}
        </div>
    );
};

export default ActionProvider;
