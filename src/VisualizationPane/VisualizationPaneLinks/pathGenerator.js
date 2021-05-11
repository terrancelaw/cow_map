import { line, curveNatural } from 'd3';

// helpers

const findDistance = ([ x1, y1 ], [ x2, y2 ]) => 
	Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

const findSlope = ([ x1, y1 ], [ x2, y2 ]) => (y1 - y2) / (x1 - x2);

const findMiddlePoint = ([ x1, y1 ], [ x2, y2 ]) => [ (x1 + x2) / 2, (y1 + y2) / 2 ];

const findUnitVector = s => {
	const xu = Math.sqrt(1 / (1 + s * s));
	const yu = s * xu;

	return xu >= 0 ? [ xu, yu ] : [ -xu, -yu ]; // always points to right
};

const findCentre = ([ x1, y1 ], [ x2, y2 ], r) => {
	const xa = (x2 - x1) / 2;
	const ya = (y2 - y1) / 2;
	const x0 = x1 + xa;
	const y0 = y1 + ya;
	const a = Math.sqrt(xa * xa + ya * ya);
	const b = Math.sqrt(r * r - a * a);
	const xc = x0 + b * ya / a;
	const yc = y0 - b * xa / a;

	return [ xc, yc ];
};

const findAngle = ([ x, y ], [ xc, yc ]) => {
	const xAdjusted = x - xc;
	const yAdjusted = y - yc;

	if (xAdjusted > 0 && yAdjusted === 0) return 0;
	if (xAdjusted > 0 && yAdjusted > 0) return Math.atan(yAdjusted / xAdjusted);
	if (xAdjusted < 0 && yAdjusted > 0) return Math.PI / 2 - Math.atan(yAdjusted / -xAdjusted) + Math.PI / 2;
	if (xAdjusted === 0 && yAdjusted > 0) return Math.PI / 2;
	if (xAdjusted < 0 && yAdjusted < 0) return Math.atan(-yAdjusted / -xAdjusted) + Math.PI;
	if (xAdjusted < 0 && yAdjusted === 0) return Math.PI;
	if (xAdjusted > 0 && yAdjusted < 0) return Math.PI / 2 - Math.atan(-yAdjusted / xAdjusted) + Math.PI / 2 * 3;
	if (xAdjusted === 0 && yAdjusted < 0) return Math.PI / 2 * 3
};

const findCircleCircleIntersection = ([ a, b, r0 ], [ c, d, r1 ]) => {
	const D = Math.sqrt((c - a) * (c - a) + (d - b) * (d - b));
	const r = 0.25 * Math.sqrt((D + r0 + r1) * (D + r0 - r1) * (D - r0 + r1) * (-D + r0 + r1));

	const rDiff = (r0 * r0 - r1 * r1);
	const DD = (D * D);
	const xi1 = (a + c) / 2 + (c - a) * rDiff / (2 * DD) + 2 * (b - d) * r / DD; 
	const yi1 = (b + d) / 2 + (d - b) * rDiff / (2 * DD) - 2 * (a - c) * r / DD;
	const xi2 = (a + c) / 2 + (c - a) * rDiff / (2 * DD) - 2 * (b - d) * r / DD; 
	const yi2 = (b + d) / 2 + (d - b) * rDiff / (2 * DD) + 2 * (a - c) * r / DD;

	return [ [ xi1, yi1 ], [ xi2, yi2 ] ];
};

// main functions

export const directedLink = {
	targetRadius: 15,
	selfLoopRadius: 20,
	selfLoopRadiusIncrement: 3,
	arcDivisor: 1.5,
	arcRadiusIncrement: 15,

	generatePathData(sourcePoint, targetPoint, index) {
		const self = this;
		const pointsAreSame = sourcePoint[0] === targetPoint[0] &&
							  sourcePoint[1] === targetPoint[1];

		return pointsAreSame ? 
			self.generateSelfLoop(sourcePoint, index) : 
			self.generateArc(sourcePoint, targetPoint, index);
	},
	generateArc(sourcePoint, targetPoint, index) {
		const self = this;
		const arcDivisor = self.arcDivisor;
		const radiusIncrement = self.arcRadiusIncrement;

		// find radius
		const distance = findDistance(sourcePoint, targetPoint);
		const radius = distance / arcDivisor + radiusIncrement * index;
		const targetRadius = self.targetRadius >= distance ? distance / 2 : self.targetRadius;

		// find new target (some distance away from original)
		const centre = findCentre(sourcePoint, targetPoint, radius);
		const [ intersection1, intersection2 ] = findCircleCircleIntersection(
			[ ...centre, radius ], [ ...targetPoint, targetRadius ]
		);
		const sourceAngle = findAngle(sourcePoint, centre);
		const targetAngle = findAngle(targetPoint, centre);
		const intersection1Angle = findAngle(intersection1, centre);
		const intersection1BtwSourceAndTarget = 
			(intersection1Angle >= sourceAngle && intersection1Angle <= targetAngle) ||
			(intersection1Angle >= targetAngle && intersection1Angle <= sourceAngle);
		const newTargetPoint = (sourceAngle < Math.PI && targetAngle > Math.PI) ?
							   (intersection1BtwSourceAndTarget ? intersection2 : intersection1) :
							   (intersection1BtwSourceAndTarget ? intersection1 : intersection2);

		// return path
		return `M ${ sourcePoint[0] } ${ sourcePoint[1] } ` + 
			   `A ${ radius } ${ radius } 0 0 0 ${ newTargetPoint[0] } ${ newTargetPoint[1] }`;
	},
	generateSelfLoop(sourcePoint, index) {
		const self = this;
		const radiusIncrement = self.selfLoopRadiusIncrement;
		const radius = self.selfLoopRadius + radiusIncrement * index;

		// find target
		const centre = [ sourcePoint[0] + radius, sourcePoint[1] ];
		const targetAngle = Math.PI + Math.PI * 2 - Math.PI / 8;
		const targetPoint = [
			radius * Math.cos(targetAngle) + centre[0],
			radius * Math.sin(targetAngle) + centre[1]
		];

		// return path
		return `M ${ sourcePoint[0] } ${ sourcePoint[1] } ` + 
			   `A ${ radius } ${ radius } 0 1 0 ${ targetPoint[0] } ${ targetPoint[1] }`;
	}
};

export const undirectedLink = {
	selfLoopRadius: 20,
	distanceIncrement: 10,
	radiusIncrement: 3,

	generatePathData(sourcePoint, targetPoint, index) {
		const self = this;
		const pointsAreSame = sourcePoint[0] === targetPoint[0] &&
							  sourcePoint[1] === targetPoint[1];

		if (pointsAreSame)
			return self.generateSelfLoop(sourcePoint, index);

		if (index === -1)
			return self.generateStraightLine(sourcePoint, targetPoint);

		return self.generateCurve(sourcePoint, targetPoint, index);
	},
	generateStraightLine(sourcePoint, targetPoint) {
		return `M ${ sourcePoint[0] } ${ sourcePoint[1] } ` +
			   `L ${ targetPoint[0] } ${ targetPoint[1] }`;
	},
	generateCurve(sourcePoint, targetPoint, index) {
		const self = this;
		const distanceIncrement = self.distanceIncrement;
		const pathGenerator = line().curve(curveNatural);
		
		// find unit vector
		const middlePoint = findMiddlePoint(sourcePoint, targetPoint);
		const sameX = sourcePoint[0] === targetPoint[0];
		const sameY = sourcePoint[1] === targetPoint[1];
		let unitVector = null;

		if (!sameX && !sameY) {
			const perpendicularSlope = -1 / findSlope(sourcePoint, targetPoint);
			unitVector = findUnitVector(perpendicularSlope);
		}
		else if (sameX) unitVector = [ 1, 0 ];
		else if (sameY) unitVector = [ 0, 1 ];
		
		// find second point
		const secondPoint = [ 
			middlePoint[0] + unitVector[0] * distanceIncrement * index, 
			middlePoint[1] + unitVector[1] * distanceIncrement * index, 
		];

		// return curve
		return pathGenerator([ sourcePoint, secondPoint, targetPoint ]);
	},
	generateSelfLoop(point, index) {
		const self = this;
		const radiusIncrement = self.radiusIncrement;
		const radius = self.selfLoopRadius + radiusIncrement * index;
		
		return `M ${ point[0] } ${ point[1] } ` + 
			   `A ${ radius } ${ radius } 0 1 0 ${ point[0] - radius * 2 } ${ point[1] } ` +
			   `A ${ radius } ${ radius } 0 1 0 ${ point[0] } ${ point[1] }`;
	}
};