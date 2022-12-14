import {
    ActionRow, Button, ButtonClickGameEvent, ButtonStyle, DiscordApi, EventType, GameEvent, GamePluginEntryPoint, JoinGameEvent, MessageGameEvent, SelectMenu, SelectMenuChangedGameEvent, SelectOption
} from "discord-text-games-api";

import fs from "fs";
import path from "path";

export default class SampleSeedGame implements GamePluginEntryPoint<void> {
    public discordApi !: DiscordApi;

    constructor(args ?: string) {
	}

    public initialize(): Promise<void> {
        return Promise.resolve();
    }

    public destroy(): Promise<void> {
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
        this.discordApi.sendMessageToUser(event.user.id, `Hello user <@${event.user.id}>`).then((messageDescriptor) => {
            console.log("join message delivered, message id = " + messageDescriptor.messageId);
        });
    }

    private handleMessage(event : MessageGameEvent) {
        console.log(event);

        event.attachments?.map(attachment => {
            return fs.promises.readFile(attachment).then(buffer => {
                const filename = path.parse(attachment).base;
                return Promise.all([
                    fs.promises.rm(attachment), //we don't need that any more
                    this.discordApi.sendMessageToUser(event.user.id, `Attachment received. Content of the file ${filename} is:\n` + "```"  + buffer + "```")
                ]);
            });
        });

        if (event.text === "button") {
            // user wants button - generate it for him!
            this.discordApi.sendMessageToUser(event.user.id, `<@${event.user.id}>'s message was:\n ${event.text}`, {
                components: [
                    new ActionRow([
                        new Button({
                            style: ButtonStyle.Primary,
                            label: "Click to disable",
                            custom_id: "button1"
                        }),
                        new Button({
                            style: ButtonStyle.Danger,
                            label: "Click to disable",
                            emoji: {
                                name: "??????"
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
                            label: "Submit image",
                            custom_id: "button3"
                        })
                    ])
                ]
            });
        }

    }

    private handleButtonClick(event : ButtonClickGameEvent) {
        // do something
        if (event.buttonId === "button3") {
            if (fs.existsSync("%gameDefDir%/sample.png")) {
                this.discordApi.sendMessageToUser(event.user.id, "image", {
                    files: ["%gameDefDir%/sample.png"]
                });
            } else {
                console.log("file not exists");
            }
        } else {
            this.discordApi.setControlEnabled(event.channelId, event.messageId, event.buttonId, false);
        }
    }

    private handleSelectChange(event : SelectMenuChangedGameEvent) {
        // do something
        this.discordApi.setControlEnabled(event.channelId, event.messageId, event.selectId, false);
    }
}
