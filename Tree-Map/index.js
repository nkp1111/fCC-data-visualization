import * as d3 from "https://cdn.skypack.dev/d3@7.6.1";

// description //
const heading = 'Video Game Sales'
const subHeading = 'Top 100 Most Sold Video Games Grouped by Platform'

const body = d3.select('#title')
let description = body.append('header')
  .attr('id', 'description')

description.append('h1')
  .text(heading)
description.append('p')
  .text(subHeading)

// tooltip //
let tooltip = body.append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0)

// svg //
const width = 960
const height = 640
const margin = { top: 30, bottom: 150, left: 50, right: 50 }
const innerHeight = height - margin.top - margin.bottom
const innerWidth = width - margin.left - margin.right
const treeHeight = innerHeight - 80
// legend variable
const legendSize = 20
const legendXOffset = 120
const legendYOffset = 10
const legendTextOffset = 25
// text on rect
const textSize = 14

body.append('svg')
  .attr('width', width)
  .attr('height', height)

const main = d3.select('svg')
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// url //
const KickstarterPledges = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
const MovieSales = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
const VideoGameSales = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'

// Promise.all([
//   d3.json(KickstarterPledges),
//    d3.json(MovieSales),
//    d3.json(VideoGameSales),
//   ]).then(data => {
//   handleData(data)
// })

d3.json(VideoGameSales)
  .then(data => handleData(data))

const handleData = (data) => {

  const VideoGameSalesData = data
  const dataName = d => d.data.name
  const dataCategory = d => d.data.category
  const dataValue = d => d.data.value

  const root = d3.hierarchy(VideoGameSalesData)
    .sum(d => +d.value)

  const treemap = d3.treemap()
    .size([innerWidth, treeHeight])
    .paddingInner(3)

  treemap(root)

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  // rect //
  let cell = main.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`)

  cell.append('rect')
    .attr('class', 'tile')
    .attr('data-name', dataName)
    .attr('data-category', dataCategory)
    .attr('data-value', dataValue)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', (d) => colorScale(d.parent.data.name))
    .on('mouseover', (event, d) => {

      const x = event.pageX + 'px'
      const y = event.pageY + 'px'
      const htmltext = 'Name: ' + d.data.name + '<br>Category: ' + d.data.category + '<br>Value: ' + d.data.value
      tooltip.transition().duration(100).style('opacity', 0.8)

      tooltip.style('top', y)
        .attr('data-value', d.data.value)
        .style('left', x)
        .html(htmltext)
    })
    .on('mouseout', (d) => {
      tooltip.transition().duration(100).style('opacity', 0)
    })

  // text on rectangle
  cell.append('text')
    .html(d => {
      const width = d.x1 - d.x0
      const textlength = d.data.name.length
      const textarea = textlength * textSize
      const parts = textarea / width
      const span = Math.ceil(textlength / parts) + 2
      let newText = d.data.name.substring(0, span)
      //      for(let i = 1; i < Math.floor(parts) + 1; i++) {

      //        newText += `<tspan y="${i  * 2 +  15}" x="${i * 5}" dx="0" dy="25"> ${d.data.name.substring(i  * span, (i + 1 ) * span)} </tspan>`
      //      }

      return newText
    })
    .attr('alignment-baseline', 'hanging')
    .attr('clip-path', 'view-box')
    .style('font-size', textSize + 3)


  // drawing legend
  let legend = main.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${innerWidth / 4}, ${treeHeight + 30})`)

  legend.selectAll('rect')
    .data(colorScale.domain())
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('height', legendSize)
    .attr('width', legendSize)
    .attr('x', (d, i) => legendXOffset * (i % 3))
    .attr('y', (d, i) => Math.floor(i / 3) * (legendYOffset + legendSize))
    .attr('fill', d => colorScale(d))

  legend.selectAll('text')
    .data(colorScale.domain())
    .enter()
    .append('text')
    .attr('x', (d, i) => legendXOffset * (i % 3) + legendTextOffset)
    .attr('y', (d, i) => Math.floor(i / 3) * (legendYOffset + legendSize) + 15)
    .text(d => d)

}

