const presence = new Presence({
		clientId: "972073369564483584",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

async function getStrings() {
	return presence.getStrings(
		{
			play: "general.playing",
			pause: "general.paused",
			search: "general.search",
			episode: "general.episode",
			browsing: "general.browsing",
			viewHome: "general.viewHome",
			viewChannel: "general.viewChannel",
			watchingVid: "general.watchingVid",
			viewCategory: "general.viewCategory",
			readingAbout: "general.readingAbout",
			searchSomething: "general.searchSomething",
			buttonWatchVideo: "general.buttonWatchVideo",
			buttonViewEpisode: "general.buttonViewEpisode",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}
let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const newLang = await presence.getSetting<string>("lang").catch(() => "en"),
		presenceData: PresenceData = {
			largeImageKey: "main",
			startTimestamp: browsingTimestamp,
		},
		{ hostname, href, pathname } = document.location,
		pathArray = pathname?.split("/"),
		title = document.querySelector(".bstar-meta__title")?.textContent,
		playing = !document.querySelector(
			"img.player-mobile-icon.player-mobile-pause-icon.player-mobile-active"
		),
		thumbnail =
			document
				.querySelector(".player-mobile-video-wrap > video")
				?.getAttribute("poster")
				?.split("@")[0] ||
			document
				.querySelector<HTMLMetaElement>('meta[name="og:image"]')
				?.content?.split("@")[0];
	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}
	// Main Site
	if (hostname === "www.bilibili.tv") {
		switch (pathArray[2]) {
			case "video": {
				presenceData.details = strings.watchingVid;
				presenceData.state = title;
				presenceData.buttons = [
					{
						label: strings.buttonWatchVideo,
						url: href,
					},
				];
				break;
			}
			case "play": {
				presenceData.details = title;
				presenceData.state = `${strings.episode} ${document
					.querySelector(".ep-item__reference--active")
					.textContent?.replace(/\D/g, "")}`;
				presenceData.buttons = [
					{
						label: strings.buttonViewEpisode,
						url: href,
					},
				];
				break;
			}
			case "media": {
				presenceData.details = strings.readingAbout.replace(":", "");
				presenceData.state = document.querySelector(
					".media-detail__title"
				).textContent;
				presenceData.smallImageKey = "reading";
				presenceData.smallImageText = strings.browsing;
				break;
			}
			case "popular": {
				presenceData.details = strings.viewCategory.replace(":", "");
				presenceData.state = "Popular";
				presenceData.smallImageKey = "reading";
				presenceData.smallImageText = strings.browsing;
				break;
			}
			case "space": {
				presenceData.details = strings.viewChannel.replace(":", "");
				presenceData.state =
					document.querySelector(".space-info__name")?.textContent ??
					strings.searchSomething;
				break;
			}
			case "index": {
				presenceData.details = strings.search;
				presenceData.state =
					document.querySelector(
						"a.router-link-exact-active.router-link-active.anime-radio__tag.anime-radio__tag--active"
					)?.textContent ?? strings.searchSomething;
				presenceData.smallImageKey = "search";
				presenceData.smallImageText = strings.browsing;
				break;
			}
			default: {
				presenceData.details = strings.viewHome;
				presenceData.smallImageKey = "reading";
				presenceData.smallImageText = strings.browsing;
				break;
			}
		}
		if (pathArray[2] === "video" || pathArray[2] === "play") {
			presenceData.largeImageKey = thumbnail;
			presenceData.smallImageKey = playing ? "play" : "pause";
			if (playing) {
				[, presenceData.endTimestamp] = presence.getTimestamps(
					presence.timestampFromFormat(
						document.querySelector(".player-mobile-time-current-text")
							?.textContent ?? "00:00"
					),
					presence.timestampFromFormat(
						document.querySelector(".player-mobile-time-total-text")
							?.textContent ?? "00:00"
					)
				);
			}
		}
		// Studio
	} else if (hostname === "studio.bilibili.tv") {
		if (pathArray[1])
			presenceData.details = document.querySelector(".is-active").textContent;
		else {
			presenceData.details = document.querySelector(
				".nav-menu__menu-title"
			).textContent;
		}
		presenceData.state = "Bilibili Studio";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
