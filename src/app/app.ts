import {
    ActionRow, Button, ButtonClickGameEvent, ButtonStyle, DiscordApi, EventType, GameEvent, GamePluginEntryPoint, JoinGameEvent, MessageGameEvent, SelectMenu, SelectMenuChangedGameEvent, SelectOption, Serializable
} from "discord-text-games-api";


export default class SampleSeedGame implements GamePluginEntryPoint {
    public discordApi !: DiscordApi;

    constructor(args ?: string) {
	}

    public initialize(saveBundle ?: Serializable): Promise<unknown> {
        return Promise.resolve();
    }

    public destroy(saveBundle : Serializable): Promise<void> {
        return Promise.resolve();
    }

    public onEvent(event : GameEvent): void {
        if (event.type === EventType.JOIN) {
            this.handleJoin(event as JoinGameEvent);
        } else if (event.type === EventType.MESSAGE) {
            this.handleMessage(event as MessageGameEvent);
        } else if (event.type === EventType.BUTTON_CLICK) {
            this.handleButtonClick(event as ButtonClickGameEvent);
        } else if (event.type === EventType.SELECT_CHANGE) {
            this.handleSelectChange(event as SelectMenuChangedGameEvent);
        }
    }

    private handleJoin(event : JoinGameEvent) {

        this.discordApi.sendMessage(event.user.id, `Hello user <@${event.user.id}>`).then((messageDescriptor) => {
            console.log("join message delivered, message id = " + messageDescriptor.messageId);
        });
    }

    private handleMessage(event : MessageGameEvent) {

        if (event.text === "button") {
            // user wants button - generate it for him!
            this.discordApi.sendMessage(event.user.id, `<@${event.user.id}>'s message was:\n ${event.text}`, {
                components: [
                    new ActionRow([
                        new Button({
                            style: ButtonStyle.Primary,
                            label: "Test Button1",
                            custom_id: "button1"
                        }),
                        new Button({
                            style: ButtonStyle.Danger,
                            label: "Test Button2",
                            emoji: {
                                name: "⚔️"
                            },
                            custom_id: "button2"
                        })
                    ]),
                    new ActionRow([
                        new SelectMenu({
                            custom_id: "select1",
                            placeholder: "Feel tree to pick something",
                            options: [
                                new SelectOption({
                                    label: "option1",
                                    value: "1",
                                    description: "nobody knows what this mean"
                                }),
                                new SelectOption({
                                    label: "option2",
                                    value: "2"
                                })
                            ]
                        })
                    ]),
                    new ActionRow([
                        new Button({
                            style: ButtonStyle.Primary,
                            label: "Test Button3, row3",
                            custom_id: "button3"
                        })
                    ])
                ]
            });
        }

    }

    private handleButtonClick(event : ButtonClickGameEvent) {
        // do something
        this.discordApi.setControlEnabled(event.channelId, event.messageId, event.buttonId, false);
    }

    private handleSelectChange(event : SelectMenuChangedGameEvent) {
        // do something
        this.discordApi.setControlEnabled(event.channelId, event.messageId, event.selectId, false);
    }
}
