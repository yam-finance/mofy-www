<script lang="ts">
</script>

<div>
	<div class="loading-2">
		<div class="loading">
			<span class="dot" />
			<div class="dots">
				<span />
				<span />
				<span />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.loading-2 {
		position: relative;
		width: 120px;
	}
	.loading {
		position: absolute;
		top: 0;
		left: 0;
		width: 120px;
		height: 36px;
		background: #fff;
		filter: contrast(20);

		.dot {
			position: absolute;
			width: 12px;
			height: 12px;
			top: 12px;
			left: 15px;
			filter: blur(4px);
			background: #000;
			border-radius: 50%;
			transform: translateX(0);
			animation: dot 2s infinite;
		}
		.dots {
			transform: translateX(0);
			margin-top: 12px;
			margin-left: 31px;
			animation: dots 2s infinite;
		}
		.dots span {
			display: block;
			float: left;
			width: 12px;
			height: 12px;
			margin-left: 12px;
			filter: blur(4px);
			background: #000;
			border-radius: 50%;
		}
	}
	@-moz-keyframes dot {
		50% {
			transform: translateX(72px);
		}
	}
	@-webkit-keyframes dot {
		50% {
			transform: translateX(72px);
		}
	}
	@-o-keyframes dot {
		50% {
			transform: translateX(72px);
		}
	}
	@keyframes dot {
		50% {
			transform: translateX(72px);
		}
	}
	@-moz-keyframes dots {
		50% {
			transform: translateX(-31px);
		}
	}
	@-webkit-keyframes dots {
		50% {
			transform: translateX(-31px);
		}
	}
	@-o-keyframes dots {
		50% {
			transform: translateX(-31px);
		}
	}
	@keyframes dots {
		50% {
			transform: translateX(-31px);
		}
	}
</style>
