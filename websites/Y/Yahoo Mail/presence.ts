const presence = new Presence({
		clientId: "844109673618735144",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/1uePEgT.png",
			startTimestamp: browsingTimestamp,
		},
		privacy = await presence.getSetting("privacy"),
		{ pathname } = document.location;
	if (document.querySelector('[data-test-id="message-group-subject-text"]')) {
		presenceData.details = "Reading an email";
		presenceData.smallImageKey = "reading";
	} else if (
		document.querySelector<HTMLInputElement>('[role="combobox"]')?.value
	) {
		presenceData.details = "Searching";
		presenceData.smallImageKey = "search";
	} else if (document.querySelector('[data-test-id="recipient-input"]'))
		presenceData.details = "Composing an email";
	else if (privacy) {
		if (pathname.includes("/folders/") || pathname.includes("/search/")) {
			if (pathname.includes("messages"))
				presenceData.details = "Viewing an email";
			else presenceData.details = "Viewing mail";
		} else presenceData.details = "Browsing";
	} else if (document.querySelector('[data-test-is-active="true"]')) {
		presenceData.details = `Viewing ${document
			.querySelector('[data-test-is-active="true"]')
			.textContent.replace(/[0-9]*/gm, "")}`;
	} else presenceData.details = "Browsing";

	presence.setActivity(presenceData);
});
