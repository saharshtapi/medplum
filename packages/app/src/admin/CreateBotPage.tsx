import { AccessPolicy, OperationOutcome, Reference } from '@medplum/fhirtypes';
import { Button, Document, Form, FormSection, Input, Loading, MedplumLink, useMedplum } from '@medplum/ui';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AccessPolicyInput } from './AccessPolicyInput';

export function CreateBotPage(): JSX.Element {
  const { projectId } = useParams() as { projectId: string };
  const medplum = useMedplum();
  const [result, setResult] = useState<any>();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [accessPolicy, setAccessPolicy] = useState<Reference<AccessPolicy>>();
  const [outcome, setOutcome] = useState<OperationOutcome>();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    medplum
      .get('admin/projects/' + projectId)
      .then((response) => {
        setResult(response);
      })
      .catch(setOutcome);
  }, [medplum, projectId]);

  if (!result) {
    return <Loading />;
  }

  return (
    <Document width={600}>
      <h1>Admin / Projects / {result.project.name}</h1>
      <h3>Create new Bot</h3>
      <Form
        onSubmit={() => {
          const body = {
            name,
            description,
            accessPolicy,
          };
          medplum
            .post('admin/projects/' + projectId + '/bot', body)
            .then(() => setSuccess(true))
            .catch(setOutcome);
        }}
      >
        {!success && (
          <>
            <FormSection title="Name" htmlFor="name" outcome={outcome}>
              <Input name="name" testid="name" required={true} autoFocus={true} onChange={setName} outcome={outcome} />
            </FormSection>
            <FormSection title="Description" htmlFor="description" outcome={outcome}>
              <Input name="description" testid="description" onChange={setDescription} outcome={outcome} />
            </FormSection>
            <FormSection title="Access Policy" htmlFor="accessPolicy" outcome={outcome}>
              <AccessPolicyInput name="accessPolicy" onChange={setAccessPolicy} />
            </FormSection>
            <div className="medplum-right">
              <div></div>
              <div>
                <Button type="submit" testid="submit">
                  Create Bot
                </Button>
              </div>
            </div>
          </>
        )}
        {success && (
          <div data-testid="success">
            <p>Bot created</p>
            <p>
              Click <MedplumLink to="/admin/project">here</MedplumLink> to return to the project admin page.
            </p>
          </div>
        )}
      </Form>
    </Document>
  );
}