import * as d3 from "https://cdn.skypack.dev/d3@7.6.1";

const heading = 'United States Educational Attainment'
const subHeading = 'Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)'
const countryUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
const educationUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

const width = 960
const height = 640
const margin = { top: 120, bottom: 50, left: 50, right: 50 }
const innerHeight = height - margin.top - margin.bottom
const innerWidth = width - margin.left - margin.right
const legendWidth = 35
const legendHeight = 15
let body = d3.select('body')

//heading
let description = body.append('div')
  .attr('id', 'description')

description.append('h1').text(heading)
description.append('p').text(subHeading)

//svg
const svg = body.append('svg')
  .attr('width', width)
  .attr('height', height)

//margin-apply
const main = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

//tooltip
let tooltip = body.append('div')
  .attr('id', 'tooltip')
  .attr('opacity', 0)

//legend
let legend = main.append('g')
  .attr('id', 'legend')
  .attr('transform', `translate(${innerHeight}, 0)`)

Promise.all(
  [d3.json(countryUrl),
  d3.json(educationUrl)]
).then(data => {
  plotMap(data)
})

const plotMap = (data) => {

  const topojsonData = data[0]
  const educationData = data[1]

  let projection = d3.geoCylindricalStereographicRaw
  let path = d3.geoPath(projection)

  const { counties, states, nation } = topojsonData.objects

  const countryData = topojson.feature(topojsonData, counties)

  const colorValue = d => d.bachelorsOrHigher

  const colorScale = d3.scaleSequential(d3.interpolateGreens)
    .domain([0, d3.max(educationData, colorValue)])

  // const cScale = d3.scaleLinear()
  // .domain([0,  d3.max(educationData, colorValue)])
  // .range(['white', 'green'])

  const colorMap = new Map()

  educationData.forEach(d => {
    colorMap.set(d.fips, d)
  })

  const getEduData = (id) => getData(id).bachelorsOrHigher
  const getData = (id) => colorMap.get(id)

  main.append('g')
    .selectAll('path')
    .data(countryData.features)
    .enter()
    .append('path')
    .attr('d', d => path(d))
    .attr('class', 'county')
    .attr('fill', (d) => {
      const id = d.id
      const educationlevel = getEduData(d.id)
      return colorScale(educationlevel)
    })
    .attr('data-fips', d => getData(d.id).fips)
    .attr('data-education', d => getEduData(d.id))
    .on('mouseover', (event, d) => {
      const x = event.pageX + 'px'
      const y = event.pageY + 'px'

      const htmltext = getData(d.id)['area_name'] + '<br> ' + getData(d.id)['state'] + ': ' + colorMap.get(d.id).bachelorsOrHigher + '%'

      tooltip
        .transition()
        .duration(100)
        .style('opacity', 0.8)

      tooltip.style('top', y)
        .style('left', x)
        .html(htmltext)
        .attr('data-education', getEduData(d.id))
    })
    .on('mouseout', (d) => {
      tooltip
        .transition()
        .duration(100)
        .style('opacity', 0)
    })

  // drawing legend
  legend.selectAll('rect')
    .data(colorScale.ticks())
    .enter()
    .append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('x', (d, i) => legendWidth * i)
    .attr('fill', (d) => colorScale(d))

  const colorNum = colorScale.ticks().length
  const [start, stop] = colorScale.domain()
  const step = (stop - start) / colorNum
  const tickmarks = d3.range(start, stop + step, step)

  colorScale.range([0, legendWidth * (colorNum)])

  const xAxis = d3.axisBottom(colorScale)
    .tickValues(tickmarks)
    .tickSize(legendHeight)
    .ticks(7)

  legend.append('g')
    .attr('id', 'color-axis')
    .call(xAxis)

}