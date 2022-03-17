let data = [];
let catData = {};

let circWidth = 1000;
let circHeight = 1000;

let width = circWidth/2;
let height = circHeight/2;

let atomData = [];


let lastDate = 0;


let simulation = d3.forceSimulation()
    .force("center", d3.forceCenter(width, height))
    .force('collide', d3.forceCollide(d => d.r + 1).strength(1))
    .force('charge', d3.forceManyBody().strength( -2))
    .force('x', d3.forceX(width).strength(0.01 + 0.00004* atomData.length))
    .force('y', d3.forceY(height).strength(0.01 + 0.00004* atomData.length))
    .on('tick', ticked);



let bubble = d3.select('#bubbles')
            .attr('width', circWidth)
            .attr('height', circHeight);


// Draw big surrounding circle
overCirc = bubble.append('circle')
        .attr('cx', circWidth/2)
        .attr('cy', circHeight/2)
        .attr('r', (circHeight/2)-2)
        .style("stroke-width", 1)
        .attr('class', 'overcirc')
        .attr('stroke', '#dadada')          // Stroke of big circle. Delete when positioning is good.
        .attr('fill', 'black');


 // Percentage subtext
 datTxt = bubble.selectAll('text.value')
 .data(catData).enter()
 .append('text')
     .attr('class','value-text')
     .attr('x', 0)
     .attr('y', 50)
     .text(d => d.name)
     //.call(wrap, 250)
     //.attr('transform', function(d) {return `translate(${d.position.x},${d.position.y}) rotate(${d.position.angle})`})
     //.style('fill', d => d.color)
     //.style("font-family", "arial")
     //.style("font-size", "40px")
     //.style("text-anchor", "middle")


d3.json("test_data.json")
    .then(data => {catData = data.categories;})
    .then(() => {

        datTxt = bubble.selectAll('text.value')
        .data(catData).enter()
        .append('text')
            .attr('class','value-text')
            .attr('x', 0)
            .attr('y', 50)
            .text(d => d.name)
            .attr('transform', function(d) {return `translate(${d.position.x},${d.position.y}) rotate(${d.position.angle})`})
            .style('fill', d => d.color)
            .style("font-family", "arial")
            .style("font-size", "40px")
            .style("text-anchor", "middle")

        //initial adding
        fetch(`http://library-open-spaces.tudelft.nl/api/users/classification`)       // Connect to Flask server
        .then(response => response.json())
        .then(data => {
            //console.log("pulled data");

            data = data.result;
            
            //map every user to its idividual categories
            data = data.map(userData => {
                let retval = [];
                for (let j = 0; j < 4; j++) {

                    retval.push({
                        "id": Date.parse(userData.go_time) + j,
                        "category": catData[j].name,
                        "score": userData.classification[j],
                        "color": catData[j].color,
                        "goTime": userData.go_time
                    });
                }
                return retval;            
            });
            data = data.flat(1); //flatten the list, so we get a single list of bubbles
            data = genBubble(data); //generate radius and location data for the bubbles
            data = data.children;

            //only keep needed data (especially remove x/y data as that fucks with the simulation)
            data = data.map( d => { 
                return {
                    'id': d.data.id,
                    'category': d.data.category, 
                    'r': d.r, 
                    'color': d.data.color,
                    'goTime' : Date.parse(d.data.goTime),
                    'score': d.data.score
                }; 
            });

            atomData = data
            dateList = data.map(d => d.goTime)
            lastDate = Math.max(...dateList);


            //select all bubbles
            let bubbles = bubble.selectAll(".bubbles");

            simulation.nodes(atomData);
            simulation.alpha(1);
            simulation.restart();

            bubbles
            .data(atomData)
            .join(
                enter => { //add a new one when we didn't have the data already
                    //console.log("pulled data entering");

                    enter
                    .append('circle')
                    .attr('r', d => d.r)
                    .attr('id', d => d.id)
                    //.style("stroke-width", 1)
                    //.attr('stroke', '#dadada')          // Stroke of big circle. Delete when positioning is good.
                    .attr('fill', d => d.color)
                    .attr('class', 'bubbles blink')
            
                
                    bubbles = enter.merge(bubbles);
                    
                    //console.log(bubbles);
                },
                update => { //remove the blinking if it was still on
                    update
                    //.attr('cx', d => d.x)
                    //.attr('cy', d => d.y)
                    .attr('r', d => d.r)
                    //.classed('blink', false);


                    //bubbles = update.merge(bubbles);



                }

            );

        update_percentages(atomData);

        })
    .then(() => {

        setInterval(() => {
            simulation
            .force("center", d3.forceCenter(width, height))
            .force('collide', d3.forceCollide(d => 0).strength(0.5))
            .force('charge', d3.forceManyBody().strength(2 + 3* 1/atomData.length))
            .force('x', d3.forceX(width).strength(0.01 + 0.00004* atomData.length))
            .force('y', d3.forceY(height).strength(0.01 + 0.00004* atomData.length))
            .on('tick', ticked);

            simulation.alpha(1);
            simulation.restart();

            // delay(1000).then(() => {
            //     simulation
            //     .force("center", d3.forceCenter(width, height))
            //     .force('collide', d3.forceCollide(d => d.r + 1).strength(1))
            //     .force('charge', d3.forceManyBody().strength(-3 -2 * 1/atomData.length))
            //     .force('x', d3.forceX(width).strength(d => 1/Math.abs((d.x-width))*0.1 + 0.01 + 0.00004* atomData.length))
            //     .force('y', d3.forceY(height).strength(d => 1/Math.abs((d.y-height))*0.1 + 0.01 + 0.00004* atomData.length))
            //     .on('tick', ticked);

            //     simulation.alpha(1);
            //     simulation.restart();
            // });

            delay(1500).then(() => {
                simulation
                .force("center", d3.forceCenter(width, height))
                .force('collide', d3.forceCollide(d => d.r + 1).strength(1))
                .force('charge', d3.forceManyBody().strength(-2))
                .force('x', d3.forceX(width).strength(d => 0.01 + 0.00004* atomData.length))
                .force('y', d3.forceY(height).strength(d => 0.01 + 0.00004* atomData.length))
                .on('tick', ticked);

                simulation.alpha(1);
                simulation.restart();
            });


        }, 1300);
        setInterval(()=> {
            fetch(`http://library-open-spaces.tudelft.nl/api/users/classification`)       // Connect to Flask server
            .then(response => response.json())
            .then(data => {
                //console.log("pulled data");

                data = data.result;
                
                //map every user to its idividual categories
                data = data.map(userData => {
                    let retval = [];
                    for (let j = 0; j < 4; j++) {

                        retval.push({
                            "id": Date.parse(userData.go_time) + j,
                            "category": catData[j].name,
                            "score": userData.classification[j],
                            "color": catData[j].color,
                            "goTime": userData.go_time
                        });
                    }
                    return retval;            
                });
                data = data.flat(1); //flatten the list, so we get a single list of bubbles
                data = genBubble(data); //generate radius and location data for the bubbles
                data = data.children;

                //only keep needed data (especially remove x/y data as that fucks with the simulation)
                data = data.map( d => { 
                    return {
                        'id': d.data.id,
                        'category': d.data.category, 
                        'r': d.r, 
                        'color': d.data.color,
                        'goTime' : Date.parse(d.data.goTime),
                        'score': d.data.score
                    }; 
                });

                let newData = data.filter(d => d.goTime > lastDate);
                let oldData = data.filter(d => d.goTime <= lastDate);


                dateList = data.map(d => d.goTime)
                lastDate = Math.max(...dateList);


                //select all bubbles
                let bubbles = bubble.selectAll(".bubbles");


                console.log("oldData");
                console.log(oldData.length);
                console.log(atomData.length);

                // console.log(oldData);
                // console.log("atomData before");

                // console.log(atomData);

                oldData.forEach(d => {
                    try {
                        let x = atomData.filter(elem => elem.id == d.id)[0];
                        x.r = d.r;
                    }
                    catch (e){
                    }
                    
                    //d3.select("#" + data.id).attr('r', d.r);
                });
                // console.log("atomData after");
                simulation.nodes(atomData);
                // simulation.alpha(0.5);
                // simulation.restart();

                console.log(atomData);

                //atomData = oldData;

                bubbles
                    .data(atomData)
                    .join(
                        enter => {
                        },
                        update => { //remove the blinking if it was still on
                            update
                            //.attr('cx', d => d.x)
                            //.attr('cy', d => d.y)
                            .attr('r', d => d.r);
                            //.classed('blink', false);
        
                            //update.each(d => console.log("one changed!"));
                            //bubbles = update.merge(bubbles);
        
        
                            bubbles = update.merge(bubbles)
                        });
                //simulation.nodes(atomData);
                //simulation.alpha(0.5);
                //simulation.restart();


                newData.forEach(d => {
                    //console.log(d.goTime - Date.now());
                    delay(d.goTime - Date.now())
                    .then( () => {

                        atomData = atomData.concat(d);

                        simulation.nodes(atomData);
                        //simulation.alpha(1);
                        //simulation.restart();

                        randDist = Math.random()*2*Math.PI;
                        d.x = Math.cos(randDist)*width + width;
                        d.y = Math.sin(randDist)*height + height;

                        bubble
                        .append('circle')
                        .datum(d)
                        .attr('cx', d.x) 
                        .attr('cy', d.y)
                        .attr('r', d.r + 0.003 * atomData.length)
                        .attr('id', d.id)
                       // .style("stroke-width", 1)
                       // .attr('stroke', '#dadada')          // Stroke of big circle. Delete when positioning is good.
                        .attr('fill', d.color)
                        .attr('class', 'bubbles blink')
                        .transition()
                        .duration(4000)
                        .attr('r', d.r)
                        //.merge(bubbles)



                        // console.log(bubbles.data());
                        update_percentages(bubbles.data());
                    });
                });

            })
        }, 5000);
    });
});

function genBubble(data) {
    return d3.pack(data, d => d)
                    .size([width, height])
                    .padding(2)(d3.hierarchy({ children: data}).sum(d => d.score));
};

function calc_totals(data){
        //update totals for percentages
         //reset at every new set of responses
         catData[0].val = 0;
         catData[1].val = 0;
         catData[2].val = 0;
         catData[3].val = 0;

        let bindings = {
            "Political": 0,
            "Ecological": 1,
            "Ethical": 2,
            "Mythical" :3
        }

        data.forEach(d => {
            catData[bindings[d.category]].val += d.score;
        });

       // console.log(catData[0].val)
}


function update_percentages(data) {
        // Update percentages
        calc_totals(data);

        let scoreTot =  catData[0].val + catData[1].val + catData[2].val + catData[3].val;
        for (var i=0; i<catData.length; i++) {
            catData[i].ratio = catData[i].val/(scoreTot);
        }; 

        bubble.selectAll('text.title')
                    .data(catData)
                    .join(
                        enter => enter.append('text')
                                .text(d => `${(d.ratio*100).toFixed(1)}%`)
                                .attr('class','title')
                                .attr('transform', function(d) {return `translate(${d.position.x},${d.position.y}) rotate(${d.position.angle})`})
                                .style('fill', d => d.color)
                                .style("font-family", "arial")
                                .style("font-size", "50px")
                                .style("text-anchor", "middle")
                                .style("font-weight", "1000"),
                        update => update.text(d => `${(d.ratio*100).toFixed(1)}%`),
                        exit => exit
                                .transition()
                                .attr('y', -40)
                                .remove()
        );

};



function bounds(radius, b, coord, r) {

    //coord^2 + b^2 < r^2 //assumes b has to be within the circle, so need a min of 0 and max of width 
    //coord^2 < r^2 + b^2
    // -sqrt(r^2 - b^2)) < coord < sqrt(r^2 - b^2))
    //  radius -sqrt(r^2 - b^2)) < coord < radius + sqrt(r^2 - b^2))

    let eff_radius = radius - r,
        b_new = b - radius,
        coord_new = coord - radius,
        allowed_hyp2 = Math.pow(eff_radius, 2),
        hyp2 = Math.pow(b_new,2) + Math.pow(coord_new,2);

    if (hyp2 <= allowed_hyp2){
        return coord;
    }

    //else get the angle

    
    let angle = Math.atan(b_new/coord_new),
        pos = Math.cos(angle) * eff_radius * ((coord_new >= 0) ? 1 : -1);

    return pos + radius;
    // let eff_radius = radius - r,
    //     hyp2 = Math.pow(eff_radius, 2),
    //     new_b = Math.min(width - r, Math.max(r, b)), //bind b within the circle, to prevent sqrt(x<0), can try to fix this differently by calculating the angle, and then checking what the hyp would be a bounding that

    //     new_coord = Math.max(0,coord),

    //     b2 = Math.pow((new_b - eff_radius), 2),
    //     a = Math.sqrt(hyp2 - b2);

    // // radius - sqrt(hyp^2 - b^2) < coord < sqrt(hyp^2 - b^2) + radius
    // new_coord = Math.max(eff_radius - a,
    //             Math.min(a + eff_radius, new_coord)
    //             );

                

    //return new_coord;
}


function ticked() {
    bubble.selectAll(".bubbles")
    .attr("cx", d => {d.bounded_x = bounds(500, d.y, d.x, d.r); return d.bounded_x;} )
    .attr("cy", d => {d.bounded_y = bounds(500, d.x, d.y, d.r);  return d.bounded_y;} )
    .forEach(d => {d.x = d.bounded_x;
                   d.y = d.bounded_y});
    };

function delay(time) {
    time = Math.max(0, time);
    //console.log(`created delay! was ${time}`)

    return new Promise(resolve => setTimeout(resolve, time));
};


function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
};
