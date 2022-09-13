const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

d3.json(url)
  .then(data => {

    // formatter 
    const parser = d3.timeParse('%m')
    const format = d3.format('')
    const timeFormatter = d3.timeFormat('%B')
    const timetoNumber = (d) => {
      // to convert date,s month to number 
      // e.g. january to 1 (0, 11)
      const format = d3.timeFormat('%m')
      return +format(d) - 1
    }

    // text
    const heading = 'Monthly Global Land-Surface Temperature'
    const subHeading = '1753 - 2015: base temperature 8.66℃'
    const yAxisLabel = 'Months'
    const xAxisLabel = 'Years'

    // data mapping
    const baseTemp = data['baseTemperature']
    const dataset = data['monthlyVariance']
      .map(d => {
        d['month'] = parser(d['month'])
        return d
      })

    const temperatureArray = dataset.map(d => d['variance'])

    console.log(dataset, baseTemp, temperatureArray)
    // variables
    const width = 1080
    const height = 540
    const margin = {
      top: 30,
      bottom: 200,
      left: 100,
      right: 30,
    }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    const xValue = d => d['year']
    const yValue = d => d['month']
    const tempValue = d => d['variance']
    const colors = ['#688BAB', '#7ABFCC', '#B0CBDB', '#E5E2E0', '#E6E4A6', '#F2DA57', '#E58429', '#BD2D28']
    const legendRect = 40

    // svg
    const svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // margin-apply
    const main = svg.append('g')
      .attr('class', 'main')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // heading
    const header = d3.select('#description')
    header.append('h1')
      .text(heading)
    header.append('h2')
      .text(subHeading)

    // tooltip
    let tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')

    // legend
    let legend = main.append('g')
      .attr('id', 'legend')

    // scale(x, y, color)
    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, xValue))
      .range([0, innerWidth])
    const yScale = d3.scaleTime()
      .domain(d3.extent(dataset, yValue))
      .range([0, innerHeight])

    const colorScale = d3.scaleThreshold()
      .domain(temperatureArray)
      .range(colors)

    // axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => format(d))
    // .ticks(20)
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => timeFormatter(d)).ticks(14)

    // draw-axis
    main.append('g')
      .attr('id', 'x-axis')
      .call(xAxis)
    main.append('g')
      .attr('id', 'y-axis')
      .call(yAxis)

    // width and height of each rect element
    const rectWidth = xScale(xValue(dataset[12])) - xScale(xValue(dataset[0]))
    const rectHeight = yScale(yValue(dataset[1])) - yScale(yValue(dataset[0]))

    // x-axis and y-axis modify
    d3.select('#x-axis')
      .attr('transform', `translate(0, ${innerHeight + rectHeight})`)
    d3.select('#y-axis')
      .selectAll('text')
      .attr('dy', rectHeight / 2 + 2)

    // rect
    main.append('g')
      .selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('width', d => rectWidth)
      .attr('height', d => rectHeight)
      .attr('x', (d, i) => xScale(xValue(d)))
      .attr('y', (d, i) => yScale(yValue(d)))
      .attr('fill', (d) => colorScale(tempValue(d)))
      .attr('data-year', xValue)
      .attr('data-month', d => timetoNumber(yValue(d)))
      .attr('data-temp', d => tempValue)
      .on('mouseover', (event, d) => {

        const x = event.pageX + 'px'
        const y = event.pageY + 'px'
        const rectTemp = +tempValue(d).toFixed(1)

        const text = `${xValue(d)} - ${timeFormatter(yValue(d))} 
    <br>Temperature: ${(baseTemp + rectTemp).toPrecision(2)} <sup>o</sup>c 
    <br>Variance: ${rectTemp} <sup>o</sup>c`

        tooltip.attr('data-year', xValue(d))
        tooltip
          .transition()
          .duration(300)
          .style('opacity', 0.7)

        tooltip.style('top', y).style('left', x)
        tooltip.html(text)

      })
      .on('mouseleave', (d) => {
        tooltip.style('opacity', 0)
      })

    // drawing legend
    legend.attr('transform', `translate(0, ${innerHeight + 100})`)
      .selectAll('rect')
      .data(colors)
      .enter()
      .append('rect')
      .attr('width', legendRect)
      .attr('height', legendRect)
      .attr('x', (d, i) => i * legendRect)
      .attr('fill', d => d)

    const colorLength = colors.length
    const [small, big] = d3.extent(temperatureArray)
    const step = (big - small) / colorLength
    const legendTicks = d3.range(small, big, step)
    legendTicks.push(5.2)

    const legendScale = d3.scaleLinear()
      .domain([small, big])
      .range([0, legendRect * colorLength])

    const legendAxis = d3.axisTop(legendScale)
      .tickValues(legendTicks)
      .tickFormat(d => (d + baseTemp).toFixed(1))

    legend.call(legendAxis)

  })