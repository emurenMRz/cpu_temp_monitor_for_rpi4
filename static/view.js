addEventListener("load", () => {
	let nowTime = undefined;
	const f = timestamp => {
		if (nowTime === undefined) nowTime = timestamp;
		const elapse = timestamp - nowTime;
		if (elapse >= 1000 * 60 * 5) {
			updateGraph();
			nowTime = timestamp;
		}
		requestAnimationFrame(f);
	};
	updateGraph();
	requestAnimationFrame(f);
});

function updateGraph() {
	fetch("./timeline")
		.then(r => r.json())
		.then(json => {
			const timeline = document.getElementById("timeline");
			const width = (60 / 5) * 24;
			const height = 100;
			const scale = 4;
			timeline.width = width * scale;
			timeline.height = height * scale;
			timeline.style.maxWidth = "100%";

			const ctx = timeline.getContext("2d");
			if (!ctx) throw new TypeError("No Context");

			const bgColor = "rgb(4, 4, 8)";
			const gridColor = "rgb(32, 32, 64)";
			const textColor = "white";

			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, width * scale, height * scale);

			// horizon line
			ctx.strokeStyle = gridColor;
			for (let y = 0; y <= height; y += 10) {
				ctx.beginPath();
				ctx.moveTo(0, y * scale);
				ctx.lineTo(width * scale, y * scale);
				ctx.stroke();

				ctx.fillStyle = textColor;
				ctx.fillText(`${("" + (height - y)).padStart(3)}℃`, 8, y * scale);
			}

			// vertical line
			let x = 0;
			let hour = -1;
			for (const record of json) {
				const xx = (width - x) * scale;

				if (record.temp >= 40) {
					ctx.strokeStyle = record.temp >= 60 ? `orange` : `yellow`;
					ctx.beginPath();
					ctx.moveTo(xx, 0);
					ctx.lineTo(xx, height * scale);
					ctx.stroke();
				}

				const date = new Date(record.recorded_at.replace(/^(.+) GMT/, "$1"));
				const nowHours = date.getHours();
				if (hour != nowHours) {
					const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
					const timeStr = `${("" + date.getHours()).padStart(2, '0')}:${("" + date.getMinutes()).padStart(2, '0')}`;

					ctx.strokeStyle = gridColor;
					ctx.beginPath();
					ctx.moveTo(xx, 0);
					ctx.lineTo(xx, height * scale);
					ctx.stroke();

					ctx.save();
					ctx.translate(xx - 10, 0);
					ctx.rotate(90 * Math.PI / 180);
					ctx.fillText(`${dateStr} ${timeStr}`, 0, 0);
					ctx.restore();

					hour = nowHours;
				}
				++x;
				if (width - x < 0)
					break;
			}

			// temp chart
			x = 0;
			ctx.strokeStyle = "red";
			ctx.beginPath();
			for (const record of json) {
				const xx = (width - x) * scale;
				const yy = (height - record.temp) * scale;
				if (x === 0)
					ctx.moveTo(xx, yy);
				else
					ctx.lineTo(xx, yy);
				++x;
				if (width - x < 0)
					break;
			}
			ctx.stroke();
		})
		.catch(alert);
}