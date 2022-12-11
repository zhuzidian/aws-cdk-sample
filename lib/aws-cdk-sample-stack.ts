import * as cdk from 'aws-cdk-lib';
import { Tag, Tags } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HelloStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    let vpc = new ec2.Vpc(this, "VPC", {
      vpcName: `${id}-vpc`,
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        // {
        //   cidrMask: 24,
        //   name: 'public',
        //   subnetType: ec2.SubnetType.PUBLIC,
        // },
        // {
        //   cidrMask: 24,
        //   name: 'private',
        //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        // },
        // {
        //   cidrMask: 24,
        //   name: 'rds',
        //   subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        // }
      ]
    })

    // vpc.publicSubnets.map((subnet, i) => Tags.of(subnet).add("Name", `public-subnet-${i+1}`) )
    // vpc.privateSubnets.map((subnet, i) => Tags.of(subnet).add("Name", `private-subnet-${i+1}`) )

    let publicRouteTable = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: vpc.vpcId,
      tags: [{key: "Name", value: "rtb-public"}]
    })
    let privateRouteTable = new ec2.CfnRouteTable(this, "PrivateRouteTable", {
      vpcId: vpc.vpcId,
      tags: [{key: "Name", value: "rtb-private"}]
    })

    let publicSubnet1 = new ec2.CfnSubnet(this, "PublicSubnet1", {
      vpcId: vpc.vpcId,
      availabilityZone: 'ap-northeast-1a',
      cidrBlock: "10.0.0.0/24",
    })
    Tags.of(publicSubnet1).add("Name", "subnet-public1")
    
    let publicSubnet2 = new ec2.CfnSubnet(this, "PublicSubnet2", {
      vpcId: vpc.vpcId,
      availabilityZone: 'ap-northeast-1a',
      cidrBlock: "10.0.1.0/24"
    })
    Tags.of(publicSubnet2).add("Name", "subnet-public2")

    new ec2.CfnSubnetRouteTableAssociation(this, 'PublicSubnet1RouteTableAssociation', {
      routeTableId: publicRouteTable.attrRouteTableId,
      subnetId: publicSubnet1.attrSubnetId,
    });
    new ec2.CfnSubnetRouteTableAssociation(this, 'PublicSubnet2RouteTableAssociation', {
      routeTableId: publicRouteTable.attrRouteTableId,
      subnetId: publicSubnet2.attrSubnetId,
    });

    // sg
    // new ec2.SecurityGroup(this, "sg-app", {vpc: vpc})

    new ec2.CfnSecurityGroup(this, "sg-db", {
      groupDescription: 'groupDescription',
      groupName: 'sg-db',
      securityGroupIngress: [{
        ipProtocol: 'tcp',
        cidrIp: '1.2.3.4/32',
        fromPort: 22,
        toPort: 22,
        description: 'zhu',
      }],
      tags: [{
        key: 'Name',
        value: 'sg-db',
      }],
      vpcId: vpc.vpcId,
    })

  }
}
