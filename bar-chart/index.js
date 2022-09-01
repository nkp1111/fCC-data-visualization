const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'

d3.json(url)
  .then(data => {

    const parseData = d3.utcParse("%Y-%m-%d")
    const resData = data.data
    const dateData = resData.map(item => parseData(item[0]))
    // console.log( parseData(resData[0][0]))

    const width = 1000
    const height = 500
    const padding = 100

    // creating svg
    const svg = d3.select('div')
      .append('svg')
      .attr('height', height)
      .attr('width', width)

    // heading
    svg.append('text')
      .text('United States GDP')
      .attr('x', width / 3)
      .attr('y', 55)
      .style('font-size', '2.5em')

    //gross-domestice-product text
    svg.append('text')
      .text('Gross domestic product')
      .attr('x', 200)
      .attr('y', -350)
      .style('font-size', '1.1em')
      .style('transform-origin', 'top')
      .style('transform', 'rotate(-90deg)')

    // More Information: http://www.bea.gov/national/pdf/nipaguid.pdf
    svg.append('text')
      .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
      .attr('x', width / 2)
      .attr('y', height - height / 10)
      .style('font-size', '0.8em')

    // scale for y-axis
    const scaleY = d3.scaleLinear()
      .domain([0, d3.max(resData, (d) => d[1])])
      .range([height - padding, padding])

    // plotting y-axis
    const yAxis = d3.axisLeft(scaleY)
    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis)

    // scale for x-axis
    const scaleX = d3.scaleTime()
      .domain([d3.min(dateData), d3.max(dateData)])
      .range([padding, width - padding])

    // plotting x-axis
    const xAxis = d3.axisBottom(scaleX)
    svg.append('g')
      .property('id', 'x-axis')
      .attr('transform', `translate(0, ${height - padding})`)
      .call(xAxis)


    // to find the required width for each bar
    const rectWid = (width - 2 * padding) / resData.length

    let tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
      .attr('opacity', 0)
      .style('z-index', -1)

    svg.append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .selectAll('rect')
      .data(resData)
      .enter()
      .append('rect')
      .attr('data-date', (d) => d[0])
      .attr('data-gdp', (d) => d[1])
      .attr('class', 'bar')
      .attr('width', (d, index) => rectWid)
      .attr('height', (d) => height - padding - (scaleY(d[1])))
      .attr('x', (d, ind) => rectWid * ind)
      .attr('y', (d) => (scaleY(d[1])))
      .attr('fill', '#38726c')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(300)
          .style('opacity', 0.5)

        const dates = event.target.dataset.date
        // console.log(event.target.dataset.date)
        tooltip.html(d[0] + '<br>$ ' + d[1])
          .style('z-index', 1)
          .style('left', event.pageX + 'px')
          .style('top', event.pageY + 'px')
          .attr('data-date', dates)

      })
      .on('mouseleave', (d) => {
        tooltip.transition()
          .duration(300)
          .style('opacity', 0)
      })

  })