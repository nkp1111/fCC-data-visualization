import * as d3 from "https://cdn.skypack.dev/d3@7.6.1";

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'

d3.json(url)
  .then((data) => {

    // for text inside svg
    const heading = 'Doping in Professional Bicycle Racing'
    const subheading = '35 Fastest times up Alpe d\'Huez'
    const yAxisTitle = 'Time in Minutes'
    const xAxisTitle = 'Time (Years)'
    const dopingText = 'No doping allegations'
    const noDopingText = 'Riders with doping allegations'

    // data format
    const timeParser = d3.timeParse('%M:%S')
    const timeFormatter = d3.timeFormat('%M:%S')
    const format = d3.format("")


    // dataset
    const dataset = data.map(d => {
      d['Time'] = timeParser(d['Time'])
      return d
    })
    console.log(data)

    /* Creating an svg */
    const width = 960
    const height = 640
    const margin = { top: 100, bottom: 100, left: 100, right: 100 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    const legendXOffset = 250
    const legendYOffset = 50
    const legendRowGap = 30
    const legendColumnGap = 15
    const legendText = [dopingText, noDopingText]
    const color = ['#0F8C79', '#BD2D28']
    const xValue = d => d['Year']
    const yValue = d => d['Time']

    const radius = 8

    const svg = d3.select('#title')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // to apply margin
    const main = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // heading
    let header = svg.append('g')
      .attr('transform', `translate(50, 50)`)
      .attr('class', 'heading')
      .attr('fill', '#635F5D')

    header.append('text')
      .text(heading)
      .attr('transform', `translate(${innerWidth / 5}, 0)`)

    header.append('text')
      .attr('class', 'small')
      .text(subheading)
      .attr('y', 25)
      .attr('x', innerWidth / 3)

    // labels
    svg.append('text')
      .attr('class', 'text')
      .text(yAxisTitle)
      .attr('x', 50)
      .attr('y', 50)
      .attr('transform', `translate(0, ${height / 2 + 30}) rotate(-90)`)

    svg.append('text')
      .attr('class', 'text')
      .text(xAxisTitle)
      .attr('transform', `translate(${width / 2}, ${height - 60})`)

    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, xValue))
      .range([0, innerWidth])
      .nice()

    const yScale = d3.scaleTime()
      .domain(d3.extent(dataset, yValue))
      .range([0, innerHeight])
      .nice()

    const [start, end] = yScale.domain()
    // const minutes = d3.timeSeconds(start, end, 20)
    // console.log(minutes)

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => format(d))

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => timeFormatter(d))
    // .tickValues(minutes)

    let tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
      .attr('opacity', 0)

    main.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)

    main.append('g')
      .attr('id', 'y-axis')
      .call(yAxis)

    main.append('g')
      .selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('data-xvalue', xValue)
      .attr('data-yvalue', yValue)
      .attr('r', radius)
      .attr('cx', d => xScale(xValue(d)))
      .attr('cy', d => yScale(yValue(d)))
      .attr('stroke', '#635F5D')
      .attr('fill', (d) => {
        if (d['Doping']) {
          return color[1]
        }
        return color[0]
      })
      .on('mouseover', (e, d) => {
        const target = e.target

        // tooltip text
        const text = `${d['Name']}: ${d['Nationality']} <br> Year: ${d['Year']}, Time: ${timeFormatter(d['Time'])} <br><br> ${d['Doping']}`

        tooltip.transition().duration(100).style('opacity', 0.7)
        tooltip.attr('data-year', xValue(d))
          .style('top', e.pageY + 'px')
          .style('left', e.pageX + 'px')
          .html(text)
      })
      .on('mouseleave', (d) => {
        tooltip.transition().duration(100).style('opacity', 0)
      })

    let legend = main.append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${innerWidth - legendXOffset}, ${legendYOffset})`)

    legend.selectAll('circle')
      .data(color)
      .enter()
      .append('circle')
      .attr('transform', (d, i) => `translate(0, ${i * legendRowGap})`)
      .attr('fill', (d) => d)
      .attr('r', radius)

    legend.selectAll('text')
      .data(legendText)
      .enter()
      .append('text')
      .attr('class', 'text')
      .attr('transform', (d, i) => `translate(${legendColumnGap}, ${i * legendRowGap})`)
      .text(d => d)
      .attr('dy', '0.32em')

  })
