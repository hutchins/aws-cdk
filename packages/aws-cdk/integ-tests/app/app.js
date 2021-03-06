const cdk = require('@aws-cdk/cdk');
const iam = require('@aws-cdk/aws-iam');
const sns = require('@aws-cdk/aws-sns');

class MyStack extends cdk.Stack {
  constructor(parent, id) {
    super(parent, id);
    new sns.Topic(this, 'topic');

    new cdk.AvailabilityZoneProvider(this).availabilityZones;
    new cdk.SSMParameterProvider(this, { parameterName: '/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2' }).parameterValue('');
  }
}

class YourStack extends cdk.Stack {
  constructor(parent, id) {
    super(parent, id);
    new sns.Topic(this, 'topic1');
    new sns.Topic(this, 'topic2');
  }
}

class IamStack extends cdk.Stack {
  constructor(parent, id) {
    super(parent, id);

    new iam.Role(this, 'SomeRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazon.aws.com')
    });
  }
}

class ProvidingStack extends cdk.Stack {
  constructor(parent, id) {
    super(parent, id);

    new sns.Topic(this, 'BogusTopic'); // Some filler
  }
}

class ConsumingStack extends cdk.Stack {
  constructor(parent, id, providingStack) {
    super(parent, id);


    new sns.Topic(this, 'BogusTopic');  // Some filler
    new cdk.Output(this, 'IConsumedSomething', { value: providingStack.stackName });
  }
}

const app = new cdk.App();

// Deploy all does a wildcard cdk-toolkit-integration-test-*
new MyStack(app, 'cdk-toolkit-integration-test-1');
new YourStack(app, 'cdk-toolkit-integration-test-2');
// Not included in wildcard
new IamStack(app, 'cdk-toolkit-integration-iam-test');
const providing = new ProvidingStack(app, 'cdk-toolkit-integration-order-providing');
new ConsumingStack(app, 'cdk-toolkit-integration-order-consuming', providing);

app.run();
