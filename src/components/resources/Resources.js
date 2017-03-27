import helpers from '../../utils/helpers'
import 'chart.js'
import Chartkick from 'chartkick'
import si from 'systeminformation'

export default {
	template: `<transition name="slide-fade">
				<div class="content">
					<div class="resources">
						<h4>Cpu History</h4>
						<div id="cpus-chart"></div>
						<h4>Memory History</h4>
						<div id="memory-chart"></div>
					</div>
				</div>
			</transition>`,
	data() {
		return ({
			cpuValues: [],
			cpuData: [],
			memoryValues: [],
			memoryData: [],

			seconds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
				   16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
		})
	},
	mounted() {
		si.currentLoad(val => {
			let cpuCount = val.cpus.length

			for (var i = 0; i < cpuCount; i++)
				this.cpuValues.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
									 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
			
			let cpuChart = new Chartkick.LineChart('cpus-chart', this.cpuData, {
				legend: true,
				min: 0,
				max: 100,
				colors: ['#2ecc71', '#e74c3c', '#3498db', '#f1c40f']
			})

			setInterval(()=> {
				si.currentLoad(val => {
					this.cpuValues.forEach((cpu, i) => this.cpuValues[i].splice(0, 1))
					this.cpuValues.forEach((cpu, i) => this.cpuValues[i].push(val.cpus[i].load.toFixed(1)))
					this.cpuData = []
					this.cpuValues.forEach((cpu, i) => {
						let name = 'CPU' + (i+1) + ' ' + val.cpus[i].load.toFixed(1) + '%'
						this.cpuData.push({name: name, data: this.cpuValues[i].map((d, i) => [this.seconds[i], d]) })
					})
					cpuChart.updateData(this.cpuData)
				})
			}, 1000)
		})

		si.mem(ram => {
			let totalMem = helpers.prettyMemSize(ram.total)

			for (var i = 0; i < 2; i++)
				this.memoryValues.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
									 	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

			let memoryChart = new Chartkick.LineChart('memory-chart', this.memoryData, {
				colors: ['#2ecc71', '#e74c3c', '#3498db', '#f1c40f'],
				min: 0,
				max: totalMem,
				legend: true
			})

			setInterval(() => {
				si.mem(ram => {
					let usedMem = helpers.prettyMemSize(ram.total - ram.available)
					let usedSwap = helpers.prettyMemSize(ram.swapused)

					this.memoryValues.forEach((cpu, i) => this.memoryValues[i].splice(0, 1))

					this.memoryValues[0].push(usedMem)
					this.memoryValues[1].push(usedSwap)
					this.memoryData = []

					this.memoryData.push({name: "Memory", data: this.memoryValues[0].map((d, i) => [this.seconds[i], d]) })
					this.memoryData.push({name: "Swap", data: this.memoryValues[1].map((d, i) => [this.seconds[i], d]) })

					memoryChart.updateData(this.memoryData)
				})
			}, 1000)

		})

	}
}